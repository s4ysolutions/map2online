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

import {Category, Coordinate, Feature, LineString, Point, Route, isPoint} from '../../catalog';
import {metersToDegrees} from '../../lib/projection';
import {henc} from '../../lib/entities';
import {IconStyle, LineStyle, Style} from '../../style';

const PREC = 6;
export const formatCoordinate = (lonLat: Coordinate): string => {
  const degrees = metersToDegrees(lonLat);
  return `${degrees.lon.toFixed(PREC)},${degrees.lat.toFixed(PREC)},0`;
};

const begin = (styles: string): string =>
  `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
${styles}
  <Document name="map2online export - ${new Date()}">
`;
const end = (): string =>
  `  </Document>
</kml>
`;

const categoryBegin = (ident: string, category?: Category): string =>
  category
    ? `${ident}<Folder id="${category.id}">
${ident}  <name><![CDATA[${henc(category.title)}]]></name>
${ident}  <description><![CDATA[${henc(category.description.serializePlainText())}]]></description>
${ident}  <ExtendedData><Data name="rt_description"><value><![CDATA[${henc(category.description.serializeRichText())}]]></value></Data></ExtendedData>
`
    : '';

const categoryEnd = (ident: string, category?: Category): string =>
  category
    ? `${ident}</Folder>
`
    : '';


// noinspection JSUnusedLocalSymbols
// eslint-disable-next-line no-unused-vars,@typescript-eslint/no-unused-vars
const placemarkBegin = (ident: string, feature: Feature, route: Route, category?: Category): string =>
  `${ident}<Placemark id="${feature.id}">
${ident}  <name><![CDATA[${henc(feature.title)}]]></name>
${ident}  <description><![CDATA[${henc(feature.description.serializePlainText())}]]></description>
${ident}  <ExtendedData><Data name="rt_description"><value><![CDATA[${henc(feature.description.serializeRichText())}]]></value></Data></ExtendedData>
${ident}  <styleUrl>#${feature.style.id}</styleUrl>`;

// noinspection JSUnusedLocalSymbols
// eslint-disable-next-line no-unused-vars,@typescript-eslint/no-unused-vars
const placemarkEnd = (ident: string, feature: Feature, route: Route, category?: Category): string =>
  `${ident}</Placemark>`;

const tagPoint = (ident: string, geometry: Point): string =>
  `${ident}<Point>
${ident}  <coordinates>${formatCoordinate(geometry.coordinate)}</coordinates>
${ident}</Point>`;

const tagLineString = (ident: string, geometry: LineString): string =>
  `${ident}<LineString>
${ident}  <coordinates>
${ident}  ${geometry.coordinates.reduce((acc, coordinate) => acc.concat(formatCoordinate(coordinate).concat(' ')), '')}
${ident}  </coordinates>
${ident}</LineString>`;

const placemarkTag = (ident: string, feature: Feature, route: Route, category?: Category): string =>
  `${placemarkBegin(ident, feature, route, category)}
${isPoint(feature.geometry) ? tagPoint(`${ident}  `, feature.geometry) : tagLineString(`${ident}  `, feature.geometry)}
${placemarkEnd(ident, feature, route, category)}`;

// noinspection JSUnusedLocalSymbols
// eslint-disable-next-line no-unused-vars,@typescript-eslint/no-unused-vars
const routeBegin = (ident: string, route: Route, category?: Category): string =>
  `${ident}<Folder id="${route.id}">
${ident}  <name><![CDATA[${henc(route.title)}]]></name>
${ident}  <description><![CDATA[${henc(route.description.serializePlainText())}]]></description>
${ident}  <ExtendedData><Data name="rt_description"><value><![CDATA[${henc(route.description.serializeRichText())}]]></value></Data></ExtendedData>`;

// noinspection JSUnusedLocalSymbols
// eslint-disable-next-line no-unused-vars,@typescript-eslint/no-unused-vars
const routeEnd = (ident: string, route: Route, category?: Category): string =>
  `${ident}</Folder>`;

const routeTag = (ident: string, route: Route, category?: Category): string =>
  `${routeBegin(ident, route, category)}${Array.from(route.features).reduce((acc, feature) => acc.concat('\n'.concat(placemarkTag(`${ident}  `, feature, route, category))), '')}
${routeEnd(ident, route, category)}
`;

const routesKML = (ident: string, routes: Route[], category?: Category): string => (categoryBegin(ident, category))
  .concat(routes.reduce((acc, route) => acc.concat(routeTag(`${ident}  `, route, category)), ''))
  .concat(categoryEnd(ident, category));

const categoryKML = (ident: string, category: Category): string => routesKML(`${ident}  `, Array.from(category.routes), category);

const transp = 'ffffffff';
const COLOR8_LEN = 8;
const COLOR6_LEN = 6;

export const nc = (color: string): string => {
  const c0 = color.indexOf('#') === 0 ? color.slice(1) : color;
  const l = COLOR8_LEN - c0.length;
  if (l > 0) {
    return `#${transp.slice(0, l)}${c0}`;
  } else if (l < 0) {
    const c1 = c0.slice(0, COLOR8_LEN);
    return `#${c1.slice(COLOR6_LEN, COLOR8_LEN)}${c1.slice(0, COLOR6_LEN)}`;
  }
  return `#${c0.slice(COLOR6_LEN, COLOR8_LEN)}${c0.slice(0, COLOR6_LEN)}`;
};

const getIconStyleKML = (style: IconStyle): string =>
  `    <IconStyle>
      <color>${nc(style.color)}</color>
      <colorMode>${style.colorMode}</colorMode>
      <scale>${style.scale}</scale>
      <Icon><href><![CDATA[${style.icon.toString()}]]></href>
      </Icon>
      <hotSpot x="${style.hotspot.x}" y="${style.hotspot.y}" xunits="fraction" yunits="fraction" />
    </IconStyle>
`;

const getLineStyleKML = (style: LineStyle): string => {
  let s = `    <LineStyle>
      <color>${nc(style.color)}</color>
      <colorMode>${style.colorMode}</colorMode>
      <width>${style.width}</width>
      <labelVisibility>${style.labelVisibility}</labelVisibility>
`;
  if (style.outerColor !== null) {
    s += `     <outerColor>${style.outerColor}</outerColor>
`;
  }
  if (style.outerWidth !== null) {
    s += `     <outerWidth>${style.outerWidth}</outerWidth>
`;
  }
  if (style.metersWidth !== null) {
    s += `     <physicalWidth>${style.outerWidth}</physicalWidth>
`;
  }
  return `${s}    </LineStyle>
`;
};

const getStyleKML = (style: Style): string =>
  `  <Style id="${style.id}">
${style.iconStyle && getIconStyleKML(style.iconStyle) || ''}${style.lineStyle && getLineStyleKML(style.lineStyle) || ''}  </Style>`;

const getStylesKML = (styles: Style[]): string =>
  styles.map(style => getStyleKML(style)).join('');

const updateStylesFromRoutes = (routes: Route[], styles: Record<string, Style>): void => {
  for (const route of routes) {
    for (const feature of Array.from(route.features)) {
      const {style} = feature;
      if (!styles[style.id]) {
        styles[style.id] = style;
      }
    }
  }
};

const updateStylesFromCategories = (categories: Category[], styles: Record<string, Style>): void => {
  for (const category of categories) {
    updateStylesFromRoutes(Array.from(category.routes), styles);
  }
};

export const getRoutesKML = (routes: Route[], category?: Category): string => {
  const styles: Record<string, Style> = {};
  updateStylesFromRoutes(routes, styles);
  const ident = category ? '    ' : '  ';
  return begin(getStylesKML(Object.values(styles)))
    .concat(ident, routesKML(ident, routes, category))
    .concat(end());
};

export const getCategoriesKML = (categories: Category[]): string => {
  const styles: Record<string, Style> = {};
  updateStylesFromCategories(categories, styles);
  const ident = '  ';
  return begin(getStylesKML(Object.values(styles)))
    .concat(categories.reduce((acc, category) => acc.concat(categoryKML(`${ident}`, category)), ''))
    .concat(end());
};
