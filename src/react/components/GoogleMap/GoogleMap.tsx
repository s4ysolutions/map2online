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

import * as React from 'react';
import {useEffect} from 'react';
import log from '../../../log';
import './styles.scss';
import {getBaseLayer} from '../../../di-default';
import useObservable from '../../hooks/useObservable';
import {getMapDefinition, isGoogleMapDefinition} from '../../../map-sources/definitions';
import googleMapContext from './context/map';
import BaseLayer from './BaseLayer';
import {sourceNameToMapId} from './lib/mapid';
import {Subscription} from 'rxjs';
import {googleLonLat} from '../../../lib/googlemap';

const baseLayer = getBaseLayer();
let stateSubscription: Subscription | null = null;
let draggingSubscription: Subscription | null = null;
let recentMap: google.maps.Map | null = null;

const moveRecentMap = (x: number, y: number, zoom: number) => {
  if (recentMap) {
    const c = recentMap.getCenter();
    if (c) {
      const cc = googleLonLat(x, y);
      if (c.lat() !== cc.lat || c.lng() !== cc.lng) {
        recentMap.setCenter(cc);
      }
      if (zoom !== recentMap.getZoom()) {
        recentMap.setZoom(zoom);
      }
    }
  }
};

const GoogleMap: React.FunctionComponent = (): React.ReactElement | null => {
  const baseLayerName = useObservable(baseLayer.sourceNameObservable(), baseLayer.sourceName);
  const [map, setMap] = React.useState<google.maps.Map | null>(null);
  recentMap = map;
  log.render(`GoogleMap map is ${map ? 'set' : 'not set'} sourceName=${baseLayerName}`);

  const mapAttach = React.useCallback((el: HTMLDivElement): void => {
    log.render('GoogleMap mapAttach', el);

    if (!el) {
      setMap(null);
      return;
    }

    const {state} = baseLayer;
    const center: google.maps.LatLngLiteral = googleLonLat(state.x, state.y);

    const m = new google.maps.Map(el, {
      center,
      mapTypeId: sourceNameToMapId(baseLayerName),
      disableDefaultUI: true,
      zoom: state.zoom,
    });

    setMap(m);

  }, [baseLayerName]);

  useEffect(() => {
    log.d('dbg', 'subscribe');
    if (stateSubscription) {
      stateSubscription.unsubscribe();
      stateSubscription = null;
    }
    if (draggingSubscription) {
      draggingSubscription.unsubscribe();
      draggingSubscription = null;
    }
    stateSubscription = baseLayer.stateObservable().subscribe(state => {
      moveRecentMap(state.x, state.y, state.zoom);
    });
    draggingSubscription = baseLayer.draggingObservable().subscribe(coord => {
      moveRecentMap(coord.lon, coord.lat, baseLayer.state.zoom);
    });
    return () => {
      if (stateSubscription) {
        stateSubscription.unsubscribe();
        stateSubscription = null;
      }
      if (draggingSubscription) {
        draggingSubscription.unsubscribe();
        draggingSubscription = null;
      }
    };
  }, []);

  const md = getMapDefinition(baseLayerName);
  if (md && isGoogleMapDefinition(md)) {
    return <div className="google-map-container" ref={mapAttach} >
      {map ? <googleMapContext.Provider value={map} >
        <BaseLayer />
      </googleMapContext.Provider > : null}
    </div >;
  }

  return null;
};

export default GoogleMap;
