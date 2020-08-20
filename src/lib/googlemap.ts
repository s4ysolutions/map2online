import {Coordinate} from '../app-rx/catalog';
import {metersToDegrees0} from './projection';
import LatLngLiteral = google.maps.LatLngLiteral;

export const googleLonLat = (olX: number | Coordinate, olY?: number): LatLngLiteral => {
  const [lng, lat] = metersToDegrees0(olX, olY);
  return {lat, lng};
};
