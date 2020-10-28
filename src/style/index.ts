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

import {PIN_HOTSPOT_X, PIN_HOTSPOT_Y, PIN_SCALE, makePinURL} from './default/pin';

type Color = string

export enum StyleDisplayMode {
  DEFAULT = 'default',
  HIDE = 'hide',
}

export enum StyleColorMode {
  NORMAL = 'normal',
  RANDOM = 'random',
}

export enum StyleListItemType {
  CHECK,
  CHECKOFFONLY,
  CHECKHIDECHILDREN,
  RADIOFOLDER
}

interface ColorStyle {
  color: Color
  colorMode: StyleColorMode
}

export interface BaloonStyle {
  bgColor: Color
  textColor: string
  text: string
  displayMode: StyleDisplayMode
}

export interface IconStyle extends ColorStyle {
  scale: number
  heading: number
  icon: URL
  hotspot: { x: number, y: number }
}

// eslint-disable-next-line
export const isIconStyle = (style: any): style is IconStyle => style && style.icon !== undefined && style.hotspot !== undefined;

export interface LabelStyle extends ColorStyle {
  scale: number
}

export interface LineStyle extends ColorStyle {
  width: number
  outerColor: Color
  outerWidth: number
  metersWidth: number
  labelVisibility: boolean
}

// eslint-disable-next-line
export const isLineStyle = (style: any): style is LineStyle => style && style.labelVisibility !== undefined;

export interface ListStyle {
  listItemType: StyleListItemType
  bgColor: Color
  itemIcon: URL
  itemOpen: boolean
}

export interface PolyStyle {
  color: Color
  scale: number
}

export type StyleItem = BaloonStyle | IconStyle | LabelStyle | LineStyle | ListStyle | PolyStyle;

export interface Style {
  id: string
  balloonStyle?: BaloonStyle
  iconStyle?: IconStyle
  labelStyle?: LabelStyle
  lineStyle?: LineStyle
  listStyle?: ListStyle
  polyStyle?: PolyStyle
}

export interface Map2Styles {
  defaultStyle: Style,
  byId: (id: string) => Style | null;
  byColor: (color: Color) => Style | null;
  styles: Style[];
  findEq: (style: Style) => Style | null;
}

