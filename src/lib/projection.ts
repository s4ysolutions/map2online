import {fromLonLat, toLonLat} from 'ol/proj';
import {Coordinate, isCoordinate} from '../app-rx/catalog';
import LatLngLiteral = google.maps.LatLngLiteral;

export const metersToDegrees0 = (olX: number | Coordinate | number[], olY?: number, olAlt?: number): number[] => {
  if (olY !== undefined) {
    return toLonLat([olX as number, olY, olAlt])
  } else if (isCoordinate(olX)) {
    return toLonLat([olX.lon, olX.lat, olX.alt])
  } else if ((olX as number[]).length !== undefined && (olX as number[]).length > 1) {
    return toLonLat(olX as number[])
  } else throw Error('metersToDegrees0 accepts only OL Coordinate or pair of x, y')
}

export const metersToDegrees = (olX: number | Coordinate | number[], olY?: number, olAlt?: number): Coordinate => {
  const [lon, lat, alt] = metersToDegrees0(olX, olY, olAlt)
  return {lon, lat, alt}
}

export const degreesToMeters0 = (olX: number | Coordinate | number[], olY?: number, alt?: number): number[] => {
  if (olY !== undefined) {
    return fromLonLat([olX as number, olY, alt])
  } else if (isCoordinate(olX)) {
    return fromLonLat([olX.lon, olX.lat, olX.alt])
  } else if ((olX as number[]).length !== undefined && (olX as number[]).length > 1) {
    return fromLonLat(olX as number[])
  } else throw Error('degreesToMeters0 accepts only OL Coordinate or pair of x, y')
}

export const degreesToMeters = (olX: number | Coordinate | number[], olY?: number, olAlt?: number): Coordinate => {
  const [lon, lat, alt] = degreesToMeters0(olX, olY, olAlt)
  return {lon, lat, alt}
}

export const googleLonLat = (olX: number | Coordinate, olY?: number): LatLngLiteral => {
  const [lng, lat] = metersToDegrees0(olX, olY)
  return {lat, lng}
}

