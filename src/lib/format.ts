import {Coordinate} from '../app-rx/catalog';
import {metersToDegrees} from './projection';

const PREC = 6;
export const formatCoordinate = (lonLat: Coordinate): string => {
  const degrees = metersToDegrees(lonLat);
  return `${degrees.lat.toFixed(PREC)},${degrees.lon.toFixed(PREC)}`;
};
export const formatCoordinates = (lonLats: Coordinate[]): string => lonLats.map(formatCoordinate).join(' ');
