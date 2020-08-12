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
import useObservable from '../../hooks/useObservable';
import {subjectCursorOver} from './lib/cursorOver';
import log from '../../../log';

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

  const cursorOver = useObservable(subjectCursorOver, false)
  log.render('DrawInteraction', {cursorOver})

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
    console.log('debug DrawInteraction useEffect on color', {pointColor, lineColor, featureType})
    if (drawInteractionRef.current) {
      map.removeInteraction(drawInteractionRef.current);
      drawInteractionRef.current = null;
    }
    drawInteractionRef.current = newDrawInteraction(featureType, pointColor, lineColor);
    drawInteractionRef.current.on('drawend', handleDrawEnd);
    drawInteractionRef.current.setActive(cursorOver)
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
      drawInteractionRef.current.setActive(cursorOver)
    }
  }, [cursorOver]);

  return null;
};

export default DrawInteractions;