import React, {useEffect} from 'react';
import {Draw as DrawInteraction} from 'ol/interaction';
import usePointColor from './hooks/usePointColor';
import useLineColor from './hooks/useLineColor';
import useCurrentFeatureType from './hooks/useCurrentFeatureType';
import {FeatureType} from '../../../app-rx/ui/tools';
import {getStyle} from './lib/styles';
import {Color} from '../../../lib/colors';
import olMapContext from './context/map';
import {getCatalogUI} from '../../../di-default';
import {FeatureProps} from '../../../app-rx/catalog';
import {makeId} from '../../../l10n/id';
import {ol2coordinate, ol2coordinates} from './lib/coordinates';
import log from '../../../log';
import {useCursorOver} from './hooks/useCursorOver';
import {useModifying} from './hooks/useModifying';

const newDrawInteraction = (type: FeatureType, pointColor: Color, lineColor: Color) => new DrawInteraction({
  style: getStyle(type, type === FeatureType.Point ? pointColor : lineColor),
  type: type === FeatureType.Point ? 'Point' : 'LineString',
});

const catalogUI = getCatalogUI();

const DrawInteractions: React.FunctionComponent = (): React.ReactElement => {
  const map = React.useContext(olMapContext);
  const pointColor = usePointColor();
  const lineColor = useLineColor();
  const featureType = useCurrentFeatureType();
  const drawInteractionRef = React.useRef(null);

  const cursorOver = useCursorOver()
  const isModifying = useModifying()
  log.render('DrawInteraction', {cursorOver, isModifying})

  const handleDrawEnd = React.useCallback(({feature}) => {
      const geometry = feature.get('geometry');
      const coordinates: number[] = geometry.flatCoordinates;
      const isPoint = coordinates.length == 2;
      const featureProps: FeatureProps = {
        color: isPoint ? pointColor : lineColor,
        description: '',
        geometry: isPoint ? {coordinate: ol2coordinate(coordinates)} : {coordinates: ol2coordinates(coordinates)},
        id: makeId(),
        summary: '',
        title: '',
        visible: true,
      };
      if (catalogUI.activeRoute) {
        catalogUI.activeRoute.features.add(featureProps);
      }
    },
    [pointColor, lineColor, featureType]
  );

  useEffect(() => {
    if (drawInteractionRef.current) {
      map.removeInteraction(drawInteractionRef.current);
      drawInteractionRef.current = null;
    }
    drawInteractionRef.current = newDrawInteraction(featureType, pointColor, lineColor);
    drawInteractionRef.current.on('drawend', handleDrawEnd);
    drawInteractionRef.current.setActive(cursorOver && !isModifying)
    map.addInteraction(drawInteractionRef.current);
    return () => {
      if (drawInteractionRef.current) {
        map.removeInteraction(drawInteractionRef.current);
        drawInteractionRef.current = null;
      }
    }
  }, [pointColor, lineColor, featureType]);

  useEffect(() => {
    if (drawInteractionRef.current) {
      drawInteractionRef.current.setActive(cursorOver && !isModifying)
    }
  }, [cursorOver, isModifying]);

  return null;
};

export default DrawInteractions;