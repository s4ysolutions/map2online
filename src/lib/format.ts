import {Coordinate} from '../app-rx/catalog';

const PREC = 6;
export const formatCoordinates = (lonLat: Coordinate): string => `${lonLat.lat.toFixed(PREC)}, ${lonLat.lon.toFixed(PREC)}`;
