/*
 * Copyright 2019 s4y.solutions
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, {useCallback, useEffect} from 'react';
import Map from 'ol/Map';
import {Draw as DrawInteraction} from 'ol/interaction';
import usePointStyle from './hooks/usePointStyle';
import useLineStyle from './hooks/useLineStyle';
import useCurrentFeatureType from './hooks/useCurrentFeatureType';
import {SelectedTool} from '../../../ui/tools';
import {getOlStyle} from './lib/styles';
import {getCatalogUI, getMap2Styles} from '../../../di-default';
import {FeatureProps} from '../../../catalog';
import {ol2coordinate2, ol2coordinates2} from './lib/coordinates';
import {useCursorOver} from './hooks/useCursorOver';
import {useModifying} from './hooks/useModifying';
import {Style} from '../../../style';
import {RichText} from '../../../richtext';
import {ID_NULL} from '../../../lib/id';
import {DrawEvent} from 'ol/interaction/Draw';
import MapBrowserEvent from 'ol/MapBrowserEvent';

const map2styles = getMap2Styles();
const defaultStyles = map2styles.defaultStyle;

const newDrawInteraction = (type: SelectedTool, pointStyle: Style, lineStyle: Style) => new DrawInteraction({
  condition: (event: MapBrowserEvent<PointerEvent>) => event.type === 'pointerdown' && event.originalEvent.button === 0,
  style: getOlStyle(type === SelectedTool.Point
    ? (pointStyle.iconStyle || defaultStyles.iconStyle)
    : (lineStyle.lineStyle || defaultStyles.lineStyle)),
  type: type === SelectedTool.Point ? 'Point' : 'LineString',
});

const catalogUI = getCatalogUI();
const OL_FLATCOORDINATE_LENGTH = 2;
const RIGHT_BUTTON = 2;

const DrawInteractions: React.FunctionComponent<{ map: Map }> = ({map}): React.ReactElement | null => {
  const pointStyle = usePointStyle();
  const lineStyle = useLineStyle();
  const featureType = useCurrentFeatureType();
  const drawInteractionRef = React.useRef<DrawInteraction | null>(null);

  const cursorOver = useCursorOver();
  const isModifying = useModifying();

  const handleContextMenu = useCallback((event: MouseEvent) => {
    const pixel = map.getEventPixel(event);
    const features = map.getFeaturesAtPixel(pixel);
    console.log('=====> handleContextMenu while not drawing', features);
  }, [map]);

  const handleKeyEventDuringDrawing = useCallback((keyEvent: KeyboardEvent) => {
    if (drawInteractionRef.current) {
      let stopEvent = false;
      const code = keyEvent.code?.toLowerCase();
      if (code === 'escape' || code === 'backspace') {
        drawInteractionRef.current.abortDrawing();
        stopEvent = true;
      }
      if (stopEvent) {
        keyEvent.preventDefault();
        keyEvent.stopPropagation();
      }
    }
  }, []);

  const handleRightButtonDuringDrawing = useCallback((mouseEvent: MouseEvent) => {
    if (mouseEvent.button === RIGHT_BUTTON && drawInteractionRef.current) {
      drawInteractionRef.current.abortDrawing();
      mouseEvent.preventDefault();
      mouseEvent.stopPropagation();
    }
  }, []);

  const handleDrawStart = React.useCallback(
    () => {
      map.getTargetElement()?.addEventListener('keydown', handleKeyEventDuringDrawing);
      map.getTargetElement()?.addEventListener('mouseup', handleRightButtonDuringDrawing);
      map.getTargetElement()?.addEventListener('mousedown', handleRightButtonDuringDrawing);
      map.getTargetElement()?.removeEventListener('contextmenu', handleContextMenu);
    },
    [map, handleKeyEventDuringDrawing, handleRightButtonDuringDrawing, handleContextMenu],
  );

  const handleDrawAbort = React.useCallback(
    () => {
      map.getTargetElement()?.removeEventListener('keydown', handleKeyEventDuringDrawing);
      map.getTargetElement()?.removeEventListener('mouseup', handleRightButtonDuringDrawing);
      map.getTargetElement()?.removeEventListener('mousedown', handleRightButtonDuringDrawing);
      map.getTargetElement()?.addEventListener('contextmenu', handleContextMenu);
    },
    [map, handleKeyEventDuringDrawing, handleRightButtonDuringDrawing, handleContextMenu],
  );

  const handleDrawEnd = React.useCallback(
    ({feature}: DrawEvent) => {
      map.getTargetElement()?.removeEventListener('keydown', handleKeyEventDuringDrawing);
      map.getTargetElement()?.removeEventListener('mousedown', handleRightButtonDuringDrawing);
      map.getTargetElement()?.removeEventListener('mouseup', handleRightButtonDuringDrawing);
      map.getTargetElement()?.addEventListener('contextmenu', handleContextMenu);
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
        catalogUI.activeRoute.features.add(featureProps);
      }
    },
    [map, handleKeyEventDuringDrawing, handleRightButtonDuringDrawing, handleContextMenu, pointStyle, lineStyle],
  );


  useEffect(() => {
    if (!map) {
      return () => null;
    }
    if (drawInteractionRef.current) {
      map.removeInteraction(drawInteractionRef.current);
      drawInteractionRef.current = null;
    }
    drawInteractionRef.current = newDrawInteraction(featureType, pointStyle, lineStyle);
    drawInteractionRef.current.on('drawstart', handleDrawStart);
    drawInteractionRef.current.on('drawend', handleDrawEnd);
    drawInteractionRef.current.on('drawabort', handleDrawAbort);
    map.getTargetElement()?.addEventListener('contextmenu', handleContextMenu);
    map.addInteraction(drawInteractionRef.current);
    return () => {
      if (drawInteractionRef.current) {
        map.removeInteraction(drawInteractionRef.current);
        drawInteractionRef.current = null;
      }
    };
  }, [pointStyle, lineStyle, featureType, handleDrawEnd, map, handleDrawStart, handleDrawAbort, handleContextMenu]);

  useEffect(() => {
    if (drawInteractionRef.current) {
      drawInteractionRef.current.setActive(cursorOver && !isModifying);
    }
  }, [cursorOver, isModifying]);

  return null;
};

export default DrawInteractions;
