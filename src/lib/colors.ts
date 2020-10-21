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

export enum Color {
  BLUE = '#4363d8',
  BROWN = '#9A6324',
  CYAN = '#42d4f4',
  GREEN = '#3cb44b',
  LIME = '#bfef45',
  MAGENTA = '#f032e6',
  MAROON = '#800000',
  NAVY = '#000075',
  OLIVE = '#808000',
  ORANGE = '#f58231',
  PINK = '#fabebe',
  RED = '#e6194B',
  YELLOW = '#ffe119',
}

export const hex2Color: Record<string, Color> = {
  '#000075': Color.NAVY,
  '#3cb44b': Color.GREEN,
  '#42d4f4': Color.CYAN,
  '#4363d8': Color.BLUE,
  '#800000': Color.MAROON,
  '#808000': Color.OLIVE,
  '#9A6324': Color.BROWN,
  '#bfef45': Color.LIME,
  '#e6194B': Color.RED,
  '#f032e6': Color.MAGENTA,
  '#f58231': Color.ORANGE,
  '#fabebe': Color.PINK,
  '#ffe119': Color.YELLOW,
};
