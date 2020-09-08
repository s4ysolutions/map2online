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
import {getStyle} from './styles';
import {FeatureType} from '../../../../ui/tools';
import {coordinate2ol, coordinates2ol} from './coordinates';
import {Coordinate as OlCoordinate} from 'ol/coordinate';

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
    color: feature.color,
    geometry,
    id: feature.id,
    name: 'test',
  });
  cached.setId(feature.id);
  cached.set('color', feature.color);
  cached.setStyle(getStyle(isPoint(feature.geometry) ? FeatureType.Point : FeatureType.Line, feature.color, feature.title));

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
