import {Coordinate} from '../app-rx/catalog';

const PREC = 6;
export const formatCoordinate = (lonLat: Coordinate): string => `${lonLat.lat.toFixed(PREC)},${lonLat.lon.toFixed(PREC)}`;
export const formatCoordinates = (lonLats: Coordinate[]): string => lonLats.map(formatCoordinate).join(' ');
