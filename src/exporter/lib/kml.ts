import {Category, Coordinate, Feature, isPoint, LineString, Point, Route} from '../../app-rx/catalog';
import {metersToDegrees} from '../../lib/projection';

const PREC = 6;
export const formatCoordinate = (lonLat: Coordinate): string => {
  const degrees = metersToDegrees(lonLat)
  return `${degrees.lat.toFixed(PREC)},${degrees.lon.toFixed(PREC)},0`;
};

const begin = (): string =>
  `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
`;
const end = (): string =>
  `</kml>
`

const categoryBegin = (ident: string, category?: Category) =>
  category ?
    `${ident}<Folder id="${category.id}">
${ident}  <name>${category.title}</name>
${ident}  <description>${category.description}</description>
`
    : '';

const categoryEnd = (ident: string, category?: Category) =>
  category ?
    `${ident}</Folder>
`
    : '';

// noinspection JSUnusedLocalSymbols
const routeBegin = (ident: string, route: Route, category?: Category) =>
  `${ident}<Folder id="${route.id}">
${ident}  <name>${route.title}</name>
${ident}  <description>${route.description}</description>`;

// noinspection JSUnusedLocalSymbols
const routeEnd = (ident: string, route: Route, category?: Category) =>
  `${ident}</Folder>`;

const routeTag = (ident: string, route: Route, category?: Category) =>
  `${routeBegin(ident, route, category)}${Array.from(route.features).reduce((acc, feature) => acc.concat('\n'.concat(placemarkTag(ident + '  ', feature, route, category))), '')}
${routeEnd(ident, route, category)}
`;


// noinspection JSUnusedLocalSymbols
const placemarkBegin = (ident: string, feature: Feature, route: Route, category?: Category) =>
  `${ident}<Placemark id="${feature.id}">
${ident}  <name>${feature.title}</name>
${ident}  <description>${feature.description}</description>`;

// noinspection JSUnusedLocalSymbols
const placemarkEnd = (ident: string, feature: Feature, route: Route, category?: Category) =>
  `${ident}</Placemark>`;

const placemarkTag = (ident: string, feature: Feature, route: Route, category?: Category) =>
  `${placemarkBegin(ident, feature, route, category)}
${isPoint(feature.geometry) ? tagPoint(ident + '  ', feature.geometry) : tagLineString(ident + '  ', feature.geometry)}
${placemarkEnd(ident, feature, route, category)}`;

const tagPoint = (ident: string, geometry: Point) =>
  `${ident}<Point>
${ident}  <coordinates>${formatCoordinate(geometry.coordinate)}</coordinates>
${ident}</Point>`;

const tagLineString = (ident: string, geometry: LineString) =>
  `${ident}<LineString>
${ident}  <coordinates>
${ident}  ${geometry.coordinates.reduce((acc, coordinate) => acc.concat(formatCoordinate(coordinate).concat(' ')), '')}
${ident}  </coordinates>
${ident}</LineString>`;

export const getRoutesKML = (routes: Route[], category?: Category): string => {
  const ident = category ? '  ' : '';
  return begin()
    .concat(categoryBegin(ident, category))
    .concat(routes.reduce((acc, route) => acc.concat(routeTag(ident + '  ', route, category)), ''))
    .concat(categoryEnd(ident, category))
    .concat(end())
}
