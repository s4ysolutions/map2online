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

import {
  BalloonStyle, ColorId,
  DefaultStyle,
  IconStyle, LabelStyle,
  LineStyle, ListStyle,
  Map2Styles, PolyStyle,
  Style,
  StyleColorMode,
  StyleDisplayMode, StyleListItemType,
} from '../index';
import {Map2Color, idToMap2Color, map2colors} from './colors';
import {PIN_HOTSPOT_X, PIN_HOTSPOT_Y, PIN_SCALE, makePinURL} from './pin';
import {ID} from '../../catalog';
import {Debugger} from 'inspector';

const makeBalloonStyle = (color: ColorId): BalloonStyle => ({
  bgColor: Map2Color.TRANSPARENT,
  textColor: color,
  text: color,
  displayMode: StyleDisplayMode.DEFAULT,
});

const makeListStyle = (color: Map2Color): ListStyle => ({
  listItemType: StyleListItemType.CHECK,
  bgColor: color,
  itemIcon: new URL('http://non-existing'),
  itemOpen: false,
});

const makePolyStyle = (color: Map2Color): PolyStyle => ({
  color,
  scale: 1,
});

const makeLineStyle = (color: Map2Color, width: number): LineStyle => ({
  color,
  colorMode: StyleColorMode.NORMAL,
  width,
  /*
  outerColor: null,
  outerWidth: null,
  metersWidth: null,
  labelVisibility: true,
   */
});

const makeIconStyle = (color: Map2Color): IconStyle => ({
  color,
  colorMode: StyleColorMode.NORMAL,
  scale: PIN_SCALE,
  heading: 0,
  icon: makePinURL(color),
  hotspot: {x: PIN_HOTSPOT_X, y: PIN_HOTSPOT_Y},
});

const makeLabelStyle = (color: Map2Color): LabelStyle => ({
  color,
  colorMode: StyleColorMode.NORMAL,
  scale: 1,
});

export const map2StylesFactory = (): Map2Styles => {
  const map2stylesByColor: Record<Map2Color, DefaultStyle> = Object.values(map2colors)
    .reduce((acc, color) => ({
      ...acc, [color]: {
        id: `map2_style_${color.slice(1)}`,
        balloonStyle: makeBalloonStyle(color),
        iconStyle: makeIconStyle(color),
        labelStyle: makeLabelStyle(color),
        lineStyle: makeLineStyle(color, 1),
        listStyle: makeListStyle(color),
        polyStyle: makePolyStyle(color),
      },
    }), {} as Record<Map2Color, DefaultStyle>);
  // const map2defaultStyle = map2stylesByColor[Map2Color[Object.keys(Map2Color)[0] as keyof typeof Map2Color]];
  const map2styles = Object.values(map2stylesByColor);

  const idBalloonStyle = (style: BalloonStyle): string => `${style.textColor}-${style.bgColor}`;
  const idIconStyle = (style: IconStyle): string => `${style.icon}-${style.color}`;
  const idLabelStyle = (style: LabelStyle): string => `${style.color}`;
  const idLineStyle = (style: LineStyle): string => `${style.width}-${style.color}`;
  const idListStyle = (style: ListStyle): string => `${style.bgColor}-${style.listItemType}-${style.itemIcon}`;
  const idPolyStyle = (style: PolyStyle): string => `${style.color}`;


  const map2stylesById: Record<string, DefaultStyle> = map2styles.reduce((acc, style) => ({
    ...acc, [style.id]: style,
  }), {});
  const map2stylesByBalloonId: Record<string, DefaultStyle> = map2styles
    .reduce((acc, style) =>
      style.balloonStyle ? {...acc, [idBalloonStyle(style.balloonStyle)]: style} : acc, {});

  const map2stylesByIconId: Record<string, DefaultStyle> = map2styles.reduce((acc, style) =>
    style.iconStyle ? {...acc, [idIconStyle(style.iconStyle)]: style} : acc, {});

  const map2stylesByLabelId: Record<string, DefaultStyle> = map2styles.reduce((acc, style) =>
    style.labelStyle ? {...acc, [idLabelStyle(style.labelStyle)]: style} : acc, {});

  const map2stylesByLineId: Record<string, DefaultStyle> = map2styles.reduce((acc, style) =>
    style.lineStyle ? {...acc, [idLineStyle(style.lineStyle)]: style} : acc, {});

  const map2stylesByListId: Record<string, DefaultStyle> = map2styles.reduce((acc, style) =>
    style.listStyle ? {...acc, [idListStyle(style.listStyle)]: style} : acc, {});

  const map2stylesByPolyId: Record<string, DefaultStyle> = map2styles.reduce((acc, style) =>
    style.polyStyle ? {...acc, [idPolyStyle(style.polyStyle)]: style} : acc, {});

  return {
    byColorId: (hex: string): Style | null => {
      const color = idToMap2Color[hex];
      if (!color) {
        return null;
      }
      const ret = map2stylesByColor[color];
      if (ret !== null) {
        return ret;
      }
      return null;
    },
    byId: (id: string): Style | null => map2stylesById[id],
    defaultStyle: map2stylesByColor[map2colors.RED],
    styles: map2styles,
    // eslint-disable-next-line complexity
    findEq: (style: Style): Style | null => {
      if (!style) { // should never happen bu just in case TODO: warn?
        return null;
      }

      const required: Record<ID, DefaultStyle> = {};

      if (style.balloonStyle) {
        const found = map2stylesByBalloonId[idBalloonStyle(style.balloonStyle)];
        if (found) {
          required[found.id] = found;
        } else {
          return null;
        }
      }

      if (style.iconStyle) {
        const found = map2stylesByIconId[idIconStyle(style.iconStyle)];
        if (found) {
          required[found.id] = found;
        } else {
          return null;
        }
      }

      if (style.labelStyle) {
        const found = map2stylesByLabelId[idLabelStyle(style.labelStyle)];
        if (found) {
          required[found.id] = found;
        } else {
          return null;
        }
      }
      if (style.labelStyle) {
        const found = (style.lineStyle) ? map2stylesByLineId[idLineStyle(style.lineStyle)] : null;
        if (found) {
          required[found.id] = found;
        } else {
          return null;
        }
      }
      if (style.labelStyle) {
        const found = (style.listStyle) ? map2stylesByListId[idListStyle(style.listStyle)] : null;
        if (found) {
          required[found.id] = found;
        } else {
          return null;
        }
      }
      if (style.labelStyle) {
        const found = (style.polyStyle) ? map2stylesByPolyId[idPolyStyle(style.polyStyle)] : null;
        if (found) {
          required[found.id] = found;
        } else {
          return null;
        }
      }
      const fullMatched: DefaultStyle[] = [];
      for (const [, found] of Object.entries(required)) {
        if (!style.balloonStyle || idBalloonStyle(style.balloonStyle) === idBalloonStyle(found.balloonStyle)) {
          if (!style.iconStyle || idIconStyle(style.iconStyle) === idIconStyle(found.iconStyle)) {
            if (!style.labelStyle || idLabelStyle(style.labelStyle) === idLabelStyle(found.labelStyle)) {
              if (!style.lineStyle || idLineStyle(style.lineStyle) === idLineStyle(found.lineStyle)) {
                if (!style.listStyle || idListStyle(style.listStyle) === idListStyle(found.listStyle)) {
                  if (!style.polyStyle || idPolyStyle(style.polyStyle) === idPolyStyle(found.polyStyle)) {
                    fullMatched.push(found);
                  }
                }
              }
            }
          }
        }
      }
      return fullMatched.length === 0 ? null : fullMatched[0];
    },
  };
};

