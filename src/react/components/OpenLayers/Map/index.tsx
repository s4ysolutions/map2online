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

import 'ol/ol.css';
import * as React from 'react';
import OlMap from 'ol/Map';
import MapEvent from 'ol/MapEvent';
import View from 'ol/View';
import ResizeObserver from 'resize-observer-polyfill';
import {defaults as defaultControls} from 'ol/control';
import {getBaseLayer} from '../../../../di-default';
import {setCursorOver} from '../hooks/useCursorOver';
import T from 'l10n';
import MapBrowserEvent from 'ol/MapBrowserEvent';
import Timeout = NodeJS.Timeout;
import ZoomToFeaturesControl from '../controls/ZoomToFeaturesControl';
import MyGPSLocationControl from '../controls/MyGPSLocationControl';
import olMapContext from '../context/map';
import './styles.scss';

let resizeTimer: Timeout | null = null;

const baseLayer = getBaseLayer();

const SKIP_RESIZE_TIME_MS = 100;

const Map: React.FunctionComponent<{children: React.ReactNode[]}> = ({children}): React.ReactElement => {
  const [map, setMap] = React.useState<OlMap | null>(null);

  const mapAttach = React.useCallback((el: HTMLDivElement): void => {
    if (!el) {
      return;
    }
    const controls = defaultControls({
      zoomOptions: {
        delta: 0.25,
        zoomInTipLabel: T`Zoom in`,
        zoomOutTipLabel: T`Zoom out`,
      },
    }).extend([new ZoomToFeaturesControl()]);

    if (navigator.geolocation) {
      controls.extend([new MyGPSLocationControl()]);
    }

    const {state} = baseLayer;
    const m = new OlMap({
      controls,

      target: el,
      view: new View({
        center: [
          state.x,
          state.y,
        ],
        zoom: state.zoom,
      }),
    });
    m.on('moveend', (e: MapEvent) => {
      if (e.frameState) {
        const {viewState} = e.frameState;
        baseLayer.state = {x: viewState.center[0], y: viewState.center[1], zoom: viewState.zoom};
      }
    });
    m.on('pointerdrag', (e: MapBrowserEvent<UIEvent>) => {
      if (e.frameState) {
        const pos = e.frameState.viewState.center;
        baseLayer.setDragging({lat: pos[1], lon: pos[0], alt: 0});
      }
    });
    el.addEventListener('mouseenter', () => {
      setCursorOver(true);
    });
    el.addEventListener('mouseleave', () => {
      setCursorOver(false);
    });

    setMap(m);
  }, []);

  React.useEffect(() => {
    if (map) {
      const el = map.getTargetElement();
      const resizeObserver = new ResizeObserver(entries => {
        if (entries.length > 0) {
          if (resizeTimer) {
            clearTimeout(resizeTimer);
          }
          resizeTimer = setTimeout(() => {
            map.updateSize();
            resizeTimer = null;
          }, SKIP_RESIZE_TIME_MS);
        }
      });
      resizeObserver.observe(el);
      return () => resizeObserver.disconnect();
    }
    return () => 0;

  }, [map]);


  return <div className="ol-container" ref={mapAttach} tabIndex={0} >
    {map ? <olMapContext.Provider value={map}>
      {children }
    </olMapContext.Provider> : null}
  </div>;
};

export default Map;
