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

import {Circle as CircleStyle, Fill, Icon as IconStyle, Stroke, Style, Text} from 'ol/style';

import {Color, rgb} from 'lib/colors';
import {pinSvg} from '../../Svg/Pin';
import {FeatureType} from '../../../../app-rx/ui/tools';

// const SVG_HEIGHT = 960;
const SVG_HEIGHT = 512;
const ICON_HEIGHT = 30;
const SCALE = ICON_HEIGHT / SVG_HEIGHT;
const CENTER = 0.5;
const HEIGHT = 1;

const backgroundFill = new Fill({color: '#fff8'});
const createText = (text: string) =>
  new Text({
    backgroundFill,
    font: '14px -apple-system, BlinkMacSystemFont, \\"Segoe UI\\", Roboto, Ubuntu, \\"Helvetica Neue\\", Helvetica, sans-serif',
    offsetY: 8,
    text,
  });

const createStyle = (featureType: FeatureType, featureColor: Color, label?: string): Style => {
  const color = rgb[featureColor];
  return new Style({
    stroke: new Stroke({
      color,
      width: 2,
    }),
    image:
      featureType === FeatureType.Point
        ? new IconStyle({
          // opacity: 0.8,
          scale: SCALE,
          anchor: [
            CENTER,
            HEIGHT,
          ],
          src: pinSvg(color),
        })
        : new CircleStyle({
          radius: 7,
          stroke: new Stroke({
            color: '#ffffff',
            width: 2,
          }),
          fill: new Fill({
            color: `${color}a0`,
          }),
        }),
    // text: createText(label),
    text: label ? createText(label) : undefined,
  });
};

export const getStyle = (featureType: FeatureType, color: Color, label?: string): Style => createStyle(featureType, color, label);
