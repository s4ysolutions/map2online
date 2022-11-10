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

import React, {useEffect, useRef} from 'react';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import {LayerType} from '../lib/types';
import olMapContext from '../context/map';
import {getSearchUI} from '../../../../di-default';
import useObservable from '../../../hooks/useObservable';
import {SearchResponse} from '../../../../search';
import {GeoJSON} from 'ol/format';
import {Feature, Map} from 'ol';
import {Map2Color} from '../../../../style/colors';
import {Icon as OlIconStyle, Stroke, Style} from 'ol/style';
import {FeatureLike} from 'ol/Feature';

const searchUI = getSearchUI();
// new search arrived
const observableResponses = searchUI.observable();

const emptyUpdate: { searchResponse: SearchResponse, color: Map2Color | null } =
  null as unknown as { searchResponse: SearchResponse, color: Map2Color | null };

const observableUpdates = searchUI.observableMapUpdate();

const geoJSON = new GeoJSON();

const pins: Record<string, URL> = {};

const makePinURL = (colorPin: string): URL => {
  const cached = pins[colorPin];
  if (cached) {
    return cached;
  }
  const color = (colorPin[0] === '#') ? `%23${colorPin.slice(1)}` : colorPin;
  const pin = `data:image/svg+xml;utf8,<svg  width="384" height="512"  viewBox="0 0 384 512" xmlns="http://www.w3.org/2000/svg">
    <path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 256c-35.3 0-64-28.7-64-64s28.7-64 64-64s64 28.7 64 64s-28.7 64-64 64z" fill="${color}"/>
  </svg>`;

  const url = new URL(pin);
  pins[colorPin] = url;
  return url;
};
const SVG_HEIGHT = 512;
const ICON_HEIGHT = 30;
export const PIN_SCALE = ICON_HEIGHT / SVG_HEIGHT;
export const PIN_HOTSPOT_X = 0.5;
export const PIN_HOTSPOT_Y = 1;

const color2style = (response: SearchResponse, color: Map2Color) => new Style(response.geojson.type === 'Point'
  ? {
    image: new OlIconStyle({
      anchor: [PIN_HOTSPOT_X, PIN_HOTSPOT_Y],
      src: makePinURL(color).href,
      color,
      scale: PIN_SCALE,
    }),
  }
  : {
    stroke: new Stroke({
      color,
      width: 3,
    }),
  });

const styleFunction = (olFeature: FeatureLike) => color2style(
  olFeature.get('response') as SearchResponse,
  olFeature.get('color'),
);

const makeOlFeatureFromGeoJSON = (response: SearchResponse, color: Map2Color, map: Map): Feature => {
  const olFeature =
    geoJSON.readFeature(
      response.geojson,
      {dataProjection: response.projection, featureProjection: map.getView().getProjection()},
    );
  olFeature.set('response', response);
  olFeature.set('color', color);
  olFeature.setStyle(styleFunction(olFeature));
  return olFeature;
};

const SearchResultsLayer: React.FunctionComponent = (): null => {

  const sourceRef = useRef(new VectorSource({wrapX: false}));
  const layerRef = useRef(new VectorLayer({
    source: sourceRef.current,
    properties: {map2Id: LayerType.SEARCH_RESULTS},
  }));

  const map = React.useContext(olMapContext);

  useEffect(() => {
    const layer = layerRef.current;
    map.addLayer(layer);
    return () => {
      map.removeLayer(layer);
    };
  }, [map]);

  const responses = useObservable(observableResponses, []);
  const responseByIdRef = useRef<Record<string, Feature>>({});

  useEffect(() => {
    sourceRef.current.clear();
    responseByIdRef.current = {};
    Promise.all(responses
      .map((response: SearchResponse) => searchUI.isOnMap(response).then(color => ({response, color}))))
      .then((values) => {
        const olFeatures: Feature[] = [];
        values.forEach(value => {
          if (value.color !== null) {
            const olFeature = makeOlFeatureFromGeoJSON(value.response, value.color, map);
            olFeatures.push(olFeature);
            responseByIdRef.current[value.response.id] = olFeature;
          }
        });
        sourceRef.current.addFeatures(olFeatures);
      });
  }, [map, responses]);

  const update = useObservable(observableUpdates, emptyUpdate);

  useEffect(() => {
    if (update !== emptyUpdate) {
      const response = update.searchResponse;
      const existing = responseByIdRef.current[update.searchResponse.id];
      if (existing) {
        sourceRef.current.removeFeature(existing);
        delete responseByIdRef.current[response.id];
      }
      if (update.color !== null) {
        const olFeature = makeOlFeatureFromGeoJSON(response, update.color, map);
        responseByIdRef.current[response.id] = olFeature;
        sourceRef.current.addFeature(olFeature);
      }
    }
  }, [update, map]);

  return null;
};

export default SearchResultsLayer;
