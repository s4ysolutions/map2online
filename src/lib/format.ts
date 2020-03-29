import {Coordinate} from '../app-rx/catalog';
import {fromEPSG3857toEPSG4326} from './projection';

const PREC = 6;
export const formatCoordinate = (lonLat: Coordinate): string => {
  const epsg4326 = fromEPSG3857toEPSG4326([lonLat.lon, lonLat.lat]);
  return `${epsg4326[1].toFixed(PREC)},${epsg4326[0].toFixed(PREC)}`;
};
export const formatCoordinates = (lonLats: Coordinate[]): string => lonLats.map(formatCoordinate).join(' ');
