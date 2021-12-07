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
import {StyleItem, isIconStyle, isLineStyle} from '../../../../style';

const backgroundFill = new Fill({color: '#fff8'});
const createText = (text: string) =>
  new Text({
    backgroundFill,
    font: '14px -apple-system, BlinkMacSystemFont, \\"Segoe UI\\", Roboto, Ubuntu, \\"Helvetica Neue\\", Helvetica, sans-serif',
    offsetY: 8,
    text,
  });

const COLOR_6DIGIT_LENGTH = 7;
const makeAlpha = (color: string): string => `${(color.length <= COLOR_6DIGIT_LENGTH) ? color : color.slice(0, COLOR_6DIGIT_LENGTH)}a0`;
export const createOlStyle = (featureStyle: StyleItem, label?: string): Style => {
  if (isIconStyle(featureStyle)) {
    return new Style({
      image: new IconStyle({
        // opacity: 0.8,
        scale: featureStyle.scale,
        anchor: [
          featureStyle.hotspot.x,
          featureStyle.hotspot.y,
        ],
        src: featureStyle.icon.href,
      }),
      text: label ? createText(label) : undefined,
    });
  } else if (isLineStyle(featureStyle)) {
    return new Style({
      stroke: new Stroke({
        color: featureStyle.color.toString(),
        width: 2,
      }),
      image: new CircleStyle({
        radius: 7,
        stroke: new Stroke({
          color: '#ffffff',
          width: 2,
        }),
        fill: new Fill({
          color: makeAlpha(featureStyle.color.toString()),
        }),
      }),
      text: label ? createText(label) : undefined,
    });
  }
  throw Error(`Unsupported style type: ${JSON.stringify(featureStyle)}`);
};

export const getOlStyle = (style: StyleItem, label?: string): Style => createOlStyle(style, label);
