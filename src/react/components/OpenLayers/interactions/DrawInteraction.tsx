/*
 * Copyright 2022 s4y.solutions
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, {useEffect} from 'react';
import {Draw} from 'ol/interaction';
import usePointStyle from '../hooks/usePointStyle';
import useLineStyle from '../hooks/useLineStyle';
import useCurrentFeatureType from '../hooks/useCurrentFeatureType';
import {SelectedTool} from '../../../../ui/tools';
import {getOlStyle} from '../lib/styles';
import {getCatalogUI, getMap2Styles} from '../../../../di-default';
import {FeatureProps} from '../../../../catalog';
import {ol2coordinate2, ol2coordinates2} from '../lib/coordinates';
import {useCursorOver} from '../hooks/useCursorOver';
import {useModifying} from '../hooks/useModifying';
import {Style} from '../../../../style';
import {RichText} from '../../../../richtext';
import {ID_NULL} from '../../../../lib/id';
import {DrawEvent} from 'ol/interaction/Draw';
import MapBrowserEvent from 'ol/MapBrowserEvent';
import {setDrawing} from '../hooks/useDrawing';
import olMapContext from '../../OpenLayers/context/map';

const map2styles = getMap2Styles();
const defaultStyles = map2styles.defaultStyle;

class OlDrawInteraction extends Draw {
  private isDrawing = false;

  handleEvent(mapBrowserEvent: MapBrowserEvent<KeyboardEvent>) {
    let pass = true;
    if (this.isDrawing && mapBrowserEvent.type === 'contextmenu') {
      this.abortDrawing();
      pass = false;
    }
    return super.handleEvent(mapBrowserEvent) && pass;
  }

  setDrawing(isDrawing: boolean) {
    this.isDrawing = isDrawing;
  }
}

const newDrawInteraction = (type: SelectedTool, pointStyle: Style, lineStyle: Style) => new OlDrawInteraction({
  condition: (event: MapBrowserEvent<PointerEvent>) => event.type === 'pointerdown' && event.originalEvent.button === 0,
  style: getOlStyle(type === SelectedTool.Point
    ? (pointStyle.iconStyle || defaultStyles.iconStyle)
    : (lineStyle.lineStyle || defaultStyles.lineStyle)),
  type: type === SelectedTool.Point ? 'Point' : 'LineString',
});

const catalogUI = getCatalogUI();
const OL_FLATCOORDINATE_LENGTH = 2;

const DrawInteraction: React.FunctionComponent = (): React.ReactElement | null => {
  const map = React.useContext(olMapContext);

  const pointStyle = usePointStyle();
  const lineStyle = useLineStyle();
  const featureType = useCurrentFeatureType();
  const drawInteractionRef = React.useRef<OlDrawInteraction | null>(null);
  // const isDrawingRef = React.useRef<boolean>(false);

  const cursorOver = useCursorOver();
  const isModifying = useModifying();

  const handleDrawStart = React.useCallback(
    () => {
      setDrawing(true);
      drawInteractionRef.current?.setDrawing(true);
      // map.getViewport().addEventListener(CANCEL_DRAWING_EVENT, handleCancelDrawing, true);
    },
    [],
  );

  const handleDrawAbort = React.useCallback(
    () => {
      setDrawing(false);
      drawInteractionRef.current?.setDrawing(false);
    },
    [],
  );

  const handleDrawEnd = React.useCallback(
    ({feature}: DrawEvent) => {
      const geometry = feature.get('geometry');
      const coordinates: number[] = geometry.flatCoordinates;
      const isPoint = coordinates.length === OL_FLATCOORDINATE_LENGTH;
      const featureProps: FeatureProps = {
        style: isPoint ? pointStyle : lineStyle,
        description: RichText.makeEmpty(),
        geometry: isPoint ? {coordinate: ol2coordinate2(coordinates)} : {coordinates: ol2coordinates2(coordinates)},
        id: ID_NULL,
        summary: '',
        title: '',
        visible: true,
      };
      if (catalogUI.activeRoute) {
        catalogUI.activeRoute.features.add(featureProps).then();
      }
      setDrawing(false);
      drawInteractionRef.current?.setDrawing(false);
    },
    [pointStyle, lineStyle],
  );


  useEffect(() => {
    if (!map) {
      return () => null;
    }
    if (drawInteractionRef.current) {
      drawInteractionRef.current.un('drawstart', handleDrawStart);
      drawInteractionRef.current.un('drawend', handleDrawEnd);
      drawInteractionRef.current.un('drawabort', handleDrawAbort);

      map.removeInteraction(drawInteractionRef.current);
      drawInteractionRef.current = null;
    }
    drawInteractionRef.current = newDrawInteraction(featureType, pointStyle, lineStyle);
    drawInteractionRef.current.on('drawstart', handleDrawStart);
    drawInteractionRef.current.on('drawend', handleDrawEnd);
    drawInteractionRef.current.on('drawabort', handleDrawAbort);
    map.addInteraction(drawInteractionRef.current);
    return () => {

      if (drawInteractionRef.current) {
        drawInteractionRef.current.un('drawstart', handleDrawStart);
        drawInteractionRef.current.un('drawend', handleDrawEnd);
        drawInteractionRef.current.un('drawabort', handleDrawAbort);

        map.removeInteraction(drawInteractionRef.current);
        drawInteractionRef.current = null;
      }
    };
  }, [pointStyle, lineStyle, featureType, handleDrawEnd, map, handleDrawStart, handleDrawAbort]);

  useEffect(() => {
    if (drawInteractionRef.current) {
      drawInteractionRef.current.setActive(cursorOver && !isModifying);
    }
  }, [cursorOver, isModifying]);

  return null;
};

export default DrawInteraction;
