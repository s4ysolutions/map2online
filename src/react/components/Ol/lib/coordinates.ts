import {Coordinate} from '../../../../app-rx/catalog';

export const ol2coordinate = (flatCoordinates: number[]): Coordinate => {
  if (flatCoordinates.length !== 2) {
    throw Error("flatCoordinates must have 2 values")
  }
  return {lon: flatCoordinates[0], lat: flatCoordinates[1], alt: 0};
};

export const ol2coordinates = (flatCoordinates: number[]): Coordinate[] => {
  const ret: Coordinate[] = [];
  let i = 0;
  while (i < flatCoordinates.length) {
    ret.push({lon: flatCoordinates[i], lat: flatCoordinates[i + 1], alt: 0});
    i += 2;
    if (i > flatCoordinates.length) {
      throw Error("flatCoordinates must have even values")
    }
  }
  return ret;
};
