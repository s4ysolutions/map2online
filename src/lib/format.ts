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

import {Coordinate} from '../app-rx/catalog';
import {metersToDegrees} from './projection';

const PREC = 6;
export const formatCoordinate = (lonLat: Coordinate): string => {
  const degrees = metersToDegrees(lonLat);
  return `${degrees.lat.toFixed(PREC)},${degrees.lon.toFixed(PREC)}`;
};
export const formatCoordinates = (lonLats: Coordinate[]): string => lonLats.map(formatCoordinate).join(' ');
