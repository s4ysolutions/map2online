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

import 'ol/ol.css';
import './styles.scss';
import * as React from 'react';
import Map from 'ol/Map';
import MapEvent from 'ol/MapEvent';
import BaseLayer from './BaseLayer';
import View from 'ol/View';
import log from '../../../log';
import ActiveFeatures from './ActiveFeatures';
import olMapContext from './context/map';
import DrawInteractions from './DrawInteractions';
import ModifyInteractions from './ModifyInteractions';
import ResizeObserver from 'resize-observer-polyfill';
import {defaults as defaultControls} from 'ol/control';
import {getBaseLayer} from '../../../di-default';
import SnapInteractions from './SnapInteractions';
import {setCursorOver} from './hooks/useCursorOver';
import T from 'l10n';
import ZoomToFeaturesControl from './zoomToFeaturesControl';
import MapBrowserEvent from 'ol/MapBrowserEvent';
import Timeout = NodeJS.Timeout;

let resizeTimer: Timeout = null;

const baseLayer = getBaseLayer();

const SKIP_RESIZE_TIME_MS = 500;

const OlMap: React.FunctionComponent = (): React.ReactElement => {
  const [map, setMap] = React.useState<Map>(null);
  log.render(`OlMap map is ${map ? 'set' : 'not set'}`);

  const mapAttach = React.useCallback((el: HTMLDivElement): void => {
    log.render('OLMap mapAttach', el);
    if (!el) {
      return;
    }

    const {state} = baseLayer;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const zoomControl = new ZoomToFeaturesControl();
    const m = new Map({
      controls: defaultControls({
        zoomOptions: {
          delta: 0.25,
          zoomInTipLabel: T`Zoom in`,
          zoomOutTipLabel: T`Zoom out`,
        },
      })
        .extend([zoomControl]),
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
      const {viewState} = e.frameState;
      baseLayer.state = {x: viewState.center[0], y: viewState.center[1], zoom: viewState.zoom};
      log.d('OlMap moveend', baseLayer.state);
    });
    m.on('pointerdrag', (e: MapBrowserEvent) => {
      const pos = e.frameState.viewState.center;
      baseLayer.setDragging({lat: pos[1], lon: pos[0], alt: 0});
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


  return <div className="ol-container" ref={mapAttach} >
    {map && <olMapContext.Provider value={map} >
      <BaseLayer />
      <ActiveFeatures />
      <DrawInteractions />
      <ModifyInteractions />
      <SnapInteractions />
    </olMapContext.Provider >}
  </div >;
};

export default React.memo(OlMap);
