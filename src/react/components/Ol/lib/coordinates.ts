import {Coordinate} from '../../../../app-rx/catalog';

export const ol2coordinate = (flatCoordinates: number[]): Coordinate => {
  if (flatCoordinates.length !== 3) {
    throw Error("flatCoordinates must have 3 values")
  }
  return {lon: flatCoordinates[0], lat: flatCoordinates[1], alt: flatCoordinates[2]}
};

export const ol2coordinate2 = (flatCoordinates: number[]): Coordinate => ol2coordinate(flatCoordinates.concat(0))

export const ol2coordinates = (flatCoordinates: number[]): Coordinate[] => {
  const ret: Coordinate[] = [];
  let i = 0;
  while (i < flatCoordinates.length) {
    ret.push(ol2coordinate([flatCoordinates[i], flatCoordinates[i + 1], flatCoordinates[i + 2]]))
    i += 3;
    if (i > flatCoordinates.length) {
      throw Error("flatCoordinates must be multiply of 3")
    }
  }
  return ret;
};

export const ol2coordinates2 = (flatCoordinates: number[]): Coordinate[] => {
  const ret: Coordinate[] = [];
  let i = 0;
  while (i < flatCoordinates.length) {
    ret.push(ol2coordinate([flatCoordinates[i], flatCoordinates[i + 1], 0]))
    i += 2;
    if (i > flatCoordinates.length) {
      throw Error("flatCoordinates must be multiply of 2")
    }
  }
  return ret;
};

export const coordinate2ol = (coordinate: Coordinate): number[] => [coordinate.lon, coordinate.lat, coordinate.alt || 0];
export const coordinates2ol = (coordinates: Coordinate[]): number[][] => coordinates.map(coordinate2ol);
