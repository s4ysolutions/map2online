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

import {IconStyle, LineStyle, Map2Styles, Style, StyleColorMode} from '../index';
import {map2colors} from './colors';
import {makePinURL, PIN_HOTSPOT_X, PIN_HOTSPOT_Y, PIN_SCALE} from './pin';

const makeLineStyle = (color: string, width: number): LineStyle => ({
  color,
  colorMode: StyleColorMode.NORMAL,
  width,
  outerColor: null,
  outerWidth: null,
  metersWidth: null,
  labelVisibility: true,
});

const makeIconStyle = (color: string): IconStyle => ({
  color,
  colorMode: StyleColorMode.NORMAL,
  scale: PIN_SCALE,
  heading: 0,
  icon: makePinURL(color),
  hotspot: {x: PIN_HOTSPOT_X, y: PIN_HOTSPOT_Y},
});

export const map2StylesFactory = (): Map2Styles => {
  const map2stylesByColor: Record<string, Style> = Object.values(map2colors)
    .reduce(
      (acc, color) => ({
        ...acc, [color]: {
          id: `map2_style_${color.slice(1)}`,
          iconStyle: makeIconStyle(color),
          lineStyle: makeLineStyle(color, 1),
        },
      })
      , {},
    );
  const map2styles = Object.values(map2stylesByColor);
  // styles indexed by id
  const map2stylesById: Record<string, Style> = map2styles.reduce((acc, style) => ({
    ...acc, [style.id]: style,
  }), {});
  // styles indexed by icon urls
  const map2stylesByIcon: Record<string, Style> = map2styles.reduce((acc, style) => ({
    ...acc, [style.iconStyle.icon.toString().toLowerCase()]: style,
  }), {});
  // styles indexed by line color
  const map2stylesByLineColor: Record<string, Style> = map2styles.reduce((acc, style) => ({
    ...acc, [style.lineStyle.color.toLowerCase()]: style,
  }), {});

  return {
    byColor: (color: string): Style => map2stylesByColor[color],
    byId: (id: string): Style | null => map2stylesById[id],
    defaultStyle: map2stylesByColor[map2colors.RED],
    styles: map2styles,
    findEq: (style: Style): Style | null => {
      if (!style) { // should never happen bu just in case TODO: warn?
        return null;
      }
      if (style.balloonStyle) {
        return null;
      }
      if (!style.iconStyle) {
        return null;
      }
      if (style.labelStyle) {
        return null;
      }
      if (!style.lineStyle) {
        return null;
      }
      if (style.listStyle) {
        return null;
      }
      if (style.polyStyle) {
        return null;
      }
      if (style.lineStyle.width !== 1) {
        return null;
      }
      const lines = map2stylesByLineColor[style.lineStyle.color.toLowerCase()];
      if (lines === undefined) {
        return null;
      }

      if (!style.iconStyle.icon) {
        return null;
      }

      const icons = map2stylesByIcon[style.iconStyle.icon.toString().toLowerCase()];
      if (icons === undefined) {
        return null;
      }

      if (lines.id !== icons.id) {
        return null;
      }

      return lines;
    },
  };
};

