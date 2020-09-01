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

import {Coordinate} from '../../../../app-rx/catalog';
import {Coordinate as OlCoordinate} from 'ol/coordinate';

const COORD_LENGTH = 3;
const LAT = 1;
const ALT = 2;

export const ol2coordinate = (flatCoordinates: OlCoordinate): Coordinate => {
  if (flatCoordinates.length !== COORD_LENGTH) {
    throw Error('flatCoordinates must have 3 values');
  }
  return {lon: flatCoordinates[0], lat: flatCoordinates[LAT], alt: flatCoordinates[ALT]};
};

export const ol2coordinate2 = (flatCoordinates: OlCoordinate): Coordinate => ol2coordinate(flatCoordinates.concat(0));

export const ol2coordinates = (flatCoordinates: OlCoordinate): Coordinate[] => {
  const ret: Coordinate[] = [];
  let i = 0;
  while (i < flatCoordinates.length) {
    ret.push(ol2coordinate([flatCoordinates[i], flatCoordinates[i + LAT], flatCoordinates[i + ALT]]));
    i += COORD_LENGTH;
    if (i > flatCoordinates.length) {
      throw Error('flatCoordinates must be multiply of 3');
    }
  }
  return ret;
};

const OL_COOR_LENGTH = 2;

export const ol2coordinates2 = (flatCoordinates: OlCoordinate): Coordinate[] => {
  const ret: Coordinate[] = [];
  let i = 0;
  while (i < flatCoordinates.length) {
    ret.push(ol2coordinate([flatCoordinates[i], flatCoordinates[i + LAT], 0]));
    i += OL_COOR_LENGTH;
    if (i > flatCoordinates.length) {
      throw Error('flatCoordinates must be multiply of 2');
    }
  }
  return ret;
};

export const coordinate2ol = (coordinate: Coordinate): OlCoordinate => [coordinate.lon, coordinate.lat, coordinate.alt || 0];
export const coordinates2ol = (coordinates: Coordinate[]): OlCoordinate[] => coordinates.map(coordinate2ol);
