/* eslint-disable */
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

import {Feature, ID, LineString, Point, isLineString, isPoint} from '../../../../catalog';
import OlLineString from 'ol/geom/LineString';
import OlFeature from 'ol/Feature';
import OlPoint from 'ol/geom/Point';
import {getOlStyle} from './styles';
import {coordinate2ol, coordinates2ol} from './coordinates';
import {Coordinate as OlCoordinate} from 'ol/coordinate';
import {Style} from 'ol/style';

const cache: Record<ID, OlFeature> = {};

export const olGeometryFactory = (geometry: Point | LineString): OlPoint | OlLineString =>
  isPoint(geometry)
    ? new OlPoint(coordinate2ol(geometry.coordinate))
    : new OlLineString(coordinates2ol(geometry.coordinates));

export const olFeatureFactory = (feature: Feature): OlFeature => {
  let cached = cache[feature.id];
  if (cached) {
    return cached;
  }

  const geometry = olGeometryFactory(feature.geometry);

  cached = new OlFeature({
    // color: feature.color,
    geometry,
    id: feature.id,
    name: 'test',
  });
  cached.setId(feature.id);
  //cached.set('color', feature.color);
  cached.setStyle(getOlStyle(isPoint(feature.geometry) ? feature.style.iconStyle : feature.style.lineStyle, feature.title));

  cache[feature.id] = cached;
  return cached;
};

export const setOlFeatureCoordinates = (olFeature: OlFeature, feature: Feature): void => {
  if (isPoint(feature.geometry)) {
    const {coordinate} = feature.geometry;
    const olCoordinates: OlCoordinate = coordinate2ol(coordinate);
    (olFeature.getGeometry() as OlPoint).setCoordinates(olCoordinates);
  } else if (isLineString(feature.geometry)) {
    const {coordinates} = feature.geometry;
    const olCoordinates: OlCoordinate[] = coordinates2ol(coordinates);
    (olFeature.getGeometry() as OlLineString).setCoordinates(olCoordinates);
  }
};

const getOlFeatureStyle = (olFeature: OlFeature/*, styleLike?: Style | Style[]*/): Style | void => {
  const slike = /* styleLike || */olFeature.getStyle();
  // if (Object.prototype.hasOwnProperty.call(slike, 'getText')) {
  if ('getText' in slike) {
    return slike as Style;
  }
  if (Array.isArray(slike)) {
    const sa = slike as Style[];
    if (sa.length > 0) {
      return sa[0];
    }
  }
  /*
  left out intentionally to let the function to control the feature
  const sf = slike as StyleFunction;
  const sfs = sf(olFeature, 0);
  if (sfs) {
    return getOlFeatureStyle(olFeature, sfs);
  }*/
};

export const getOlFeatureTitle = (olFeature: OlFeature): string => {
  const style = getOlFeatureStyle(olFeature);
  return style ? style.getText().getText() : '';
};
export const setOlFeatureTitle = (olFeature: OlFeature, title: string): void => {
  const style = getOlFeatureStyle(olFeature);
  if (style) {
    const st = style.getText();
    if (st.getText() !== title) {
      st.setText(title);
      style.setText(st);
      olFeature.setStyle(style);
    }
  }
};
