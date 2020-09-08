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

const PREC = 6;
export const formatCoordinate = (lonLat: Coordinate): string => {
  const degrees = metersToDegrees(lonLat);
  return `${degrees.lat.toFixed(PREC)},${degrees.lon.toFixed(PREC)},0`;
};

const begin = (): string =>
  `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document name="map2online export - ${new Date()}">
`;
const end = (): string =>
  `  </Document>
</kml>
`;

const categoryBegin = (ident: string, category?: Category): string =>
  category
    ? `${ident}<Folder id="${category.id}">
${ident}  <name>${henc(category.title)}</name>
${ident}  <description>${henc(category.description)}</description>
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
${ident}  <name>${henc(feature.title)}</name>
${ident}  <description>${henc(feature.description)}</description>`;

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
${ident}  <name>${henc(route.title)}</name>
${ident}  <description>${henc(route.description)}</description>`;

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

const categoryKML = (ident: string, category: Category): string => routesKML(ident, Array.from(category.routes), category);

export const getRoutesKML = (routes: Route[], category?: Category): string => {
  const ident = category ? '    ' : '  ';
  return begin()
    .concat(ident, routesKML(ident, routes, category))
    .concat(end());
};

export const getCategoriesKML = (categories: Category[]): string => {
  const ident = '  ';
  return begin()
    .concat(categories.reduce((acc, category) => acc.concat(categoryKML(ident, category)), ''))
    .concat(end());
};
