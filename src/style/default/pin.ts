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

const pins: Record<string, URL> = {};
export const makePinURL = (colorPin: string): URL => {
  const cached = pins[colorPin.toString()];
  if (cached) {
    return cached;
  }
  const color = (colorPin[0] === '#') ? `%23${colorPin.slice(1)}` : colorPin;
  /*
   *return `data:image/svg+xml;utf8,<svg width="520" heigth="960" viewBox="0 0 520 960" xmlns="http://www.w3.org/2000/svg">
   *<path fill="${color}" d="M 198.55642,641.95277 260.196,958.08659 321.83557,641.95277 c -19.38276,1.97585 -39.81916,3.14949 -59.98397,3.14949 -21.70002,0 -42.64785,-0.86542 -63.29518,-3.14949 z M 443.18849,346.25702 C 427.59753,330.8208 404.36326,302.41815 383.47515,262.5922 v -63.22675 c 7.2831,-12.25612 11.7982,-38.96152 22.51289,-51.34113 14.68755,-13.2134 23.11484,-28.24853 23.11484,-44.33282 0,-52.452528 -58.80993,-94.0063421 -168.90688,-94.0063421 -110.03628,0 -175.739254,41.5538141 -175.739254,93.9450921 0,15.80669 8.15665,30.68671 22.512894,43.77663 12.94239,14.66465 21.88108,37.54088 29.94721,51.95857 v 63.22675 c -31.18097,61.89901 -78.975716,95.02587 -78.975716,95.02587 h 0.631805 C 27.811902,379.04405 9.7543946,404.97689 9.7543946,432.85397 9.815071,506.23752 107.09003,578.78726 260.196,578.72602 c 153.13582,0.0612 250.04961,-72.4885 250.04961,-145.87205 0,-33.06463 -25.28186,-63.35024 -67.05712,-86.59695 z" stroke-width="15" stroke="white" />
   *</svg>`};
   */
  const pin = `data:image/svg+xml;utf8,<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
 <path d="m254.35 340.25v171.75h22.549v-171.75c83.743-5.811 149.92-75.408 149.92-160.64 0-89.027-72.172-161.19-161.19-161.19-89.029 0-161.2 72.172-161.2 161.19 0 85.221 66.182 154.83 149.93 160.64zm11.275-275.66c63.434 0 115.03 51.607 115.03 115.02h-22.548c0-50.989-41.487-92.476-92.489-92.476z" opacity=".3" stroke-width="2.302"/>
 <path d="m235.93 321.83v171.75h22.549v-171.75c83.743-5.811 149.92-75.408 149.92-160.64 0-89.027-72.172-161.19-161.19-161.19-89.029 0-161.2 72.172-161.2 161.19 0 85.221 66.182 154.83 149.93 160.64zm11.275-275.66c63.434 0 115.03 51.607 115.03 115.02h-22.548c0-50.989-41.487-92.476-92.489-92.476z" fill="${color}" stroke-width="2.302"/>
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
