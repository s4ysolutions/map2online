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

import {ColorId} from './index';

export enum Map2Color {
  TRANSPARENT = '#00000000',
  BLUE = '#4363d8ff',
  BROWN = '#9A6324ff',
  CYAN = '#42d4f4ff',
  GREEN = '#3cb44bff',
  LIME = '#bfef45ff',
  MAGENTA = '#f032e6ff',
  MAROON = '#800000ff',
  NAVY = '#000075ff',
  OLIVE = '#808000ff',
  ORANGE = '#f58231ff',
  PINK = '#fabebeff',
  RED = '#e6194Bff',
  YELLOW = '#ffe119ff',
}

export const map2colors: Record<string, Map2Color> = {
  RED: Map2Color.RED, // default
  MAGENTA: Map2Color.MAGENTA,
  ORANGE: Map2Color.ORANGE,
  GREEN: Map2Color.GREEN,
  BLUE: Map2Color.BLUE,
  PINK: Map2Color.PINK,
  CYAN: Map2Color.CYAN,
  BROWN: Map2Color.BROWN,
  YELLOW: Map2Color.YELLOW,
};


export const idToMap2Color: Record<ColorId, Map2Color> = Object.keys(Map2Color).reduce((acc, name) => {
  const key = name as keyof typeof Map2Color;
  const color: Map2Color = Map2Color[key];
  const hex = color.toString();
  return {...acc, [hex]: color};
}, {});

export const map2ColorToName: Record<Map2Color, string> = Object.keys(Map2Color).reduce((acc, name) => {
  const key = name as keyof typeof Map2Color;
  const color: Map2Color = Map2Color[key];
  return {...acc, [color]: name};
}, {} as Record<Map2Color, string>);
