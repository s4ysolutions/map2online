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

export type ColorId = string

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

export interface ColorStyle {
  color: ColorId
  colorMode: StyleColorMode
}

export const isColorStyle = (style: unknown): style is ColorStyle => Boolean(style) &&
  (style as ColorStyle).color !== undefined &&
  (style as ColorStyle).colorMode !== undefined;

export interface BalloonStyle {
  bgColor: ColorId
  textColor: string
  text: string
  displayMode: StyleDisplayMode
}

export const isBalloonStyle = (style: unknown): style is BalloonStyle => Boolean(style) &&
  (style as BalloonStyle).bgColor !== undefined &&
  (style as BalloonStyle).textColor !== undefined;

export interface IconStyle extends ColorStyle {
  scale: number
  heading: number
  icon: URL
  hotspot: { x: number, y: number }
}

export const isIconStyle = (style: unknown): style is IconStyle => Boolean(style) &&
  (style as IconStyle).icon !== undefined &&
  (style as IconStyle).hotspot !== undefined;

export interface LabelStyle extends ColorStyle {
  scale: number
}

export const isLabelStyle = (style: unknown): style is IconStyle => isColorStyle(style) &&
  (style as IconStyle).scale !== undefined;

export interface LineStyle extends ColorStyle {
  width: number
  outerColor?: ColorId
  outerWidth?: number
  metersWidth?: number
  labelVisibility?: boolean
}

// eslint-disable-next-line
export const isLineStyle = (style: unknown): style is LineStyle => isColorStyle(style) &&
  (style as LineStyle).width !== undefined;

export interface ListStyle {
  listItemType: StyleListItemType
  bgColor: ColorId
  itemIcon: URL
  itemOpen: boolean
}

export const isListStyle = (style: unknown): style is ListStyle => Boolean(style) &&
  (style as ListStyle).listItemType !== undefined &&
  (style as ListStyle).bgColor !== undefined;

export interface PolyStyle {
  color: ColorId
  scale: number
}

export const isPolyStyle = (style: unknown): style is PolyStyle => Boolean(style) &&
  (style as PolyStyle).color !== undefined &&
  (style as PolyStyle).scale !== undefined;

export type StyleItem = BalloonStyle | IconStyle | LabelStyle | LineStyle | ListStyle | PolyStyle;

export interface Style {
  id: string
  balloonStyle?: BalloonStyle
  iconStyle?: IconStyle
  labelStyle?: LabelStyle
  lineStyle?: LineStyle
  listStyle?: ListStyle
  polyStyle?: PolyStyle
}

export interface DefaultStyle {
  id: string
  balloonStyle: BalloonStyle
  iconStyle: IconStyle
  labelStyle: LabelStyle
  lineStyle: LineStyle
  listStyle: ListStyle
  polyStyle: PolyStyle
}

export interface Map2Styles {
  defaultStyle: DefaultStyle,
  byId: (id: string) => Style | null;
  byColorId: (color: ColorId) => Style | null;
  styles: Style[];
  findEq: (style: Style) => Style | null;
}

