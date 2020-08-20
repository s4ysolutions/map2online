import {Coordinate, Feature, ID, isLineString, isPoint, LineString, Point} from '../../../../app-rx/catalog';
import OlLineString from 'ol/geom/LineString';
import OlFeature from 'ol/Feature';
import OlPoint from 'ol/geom/Point';
import {getStyle} from './styles';
import {FeatureType} from '../../../../app-rx/ui/tools';
import {coordinate2ol, coordinates2ol} from './coordinates';
import {Coordinate as OlCoordinate} from 'ol/coordinate';

const cache: Record<ID, OlFeature> = {};

export const olGeometryFactory = (geometry: Point | LineString): OlPoint | OlLineString =>
  isPoint(geometry)
    ? new OlPoint(coordinate2ol(geometry.coordinate))
    : new OlLineString(coordinates2ol(geometry.coordinates));

export const olFeatureFactory = (feature: Feature): OlFeature => {
  let cached = cache[feature.id];
  if (cached) return cached;

  const geometry = olGeometryFactory(feature.geometry);

  cached = new OlFeature({
    color: feature.color,
    geometry,
    id: feature.id,
    name: 'test',
  });
  cached.setId(feature.id);
  cached.set('color', feature.color);
  cached.setStyle(getStyle(isPoint(feature.geometry) ? FeatureType.Point : FeatureType.Line, feature.color, feature.title));

  cache[feature.id] = cached;
  return cached;
};

export const setOlFeatureCoordinates = (olFeature: OlFeature, feature: Feature): void => {
  if (isPoint(feature.geometry)) {
    const coordinate: Coordinate = feature.geometry.coordinate;
    const olCoordinates: OlCoordinate = coordinate2ol(coordinate);
    (olFeature.getGeometry() as OlPoint).setCoordinates(olCoordinates);
  } else if (isLineString(feature.geometry)) {
    const coordinates: Coordinate[] = feature.geometry.coordinates;
    const olCoordinates: OlCoordinate[] = coordinates2ol(coordinates);
    (olFeature.getGeometry() as OlLineString).setCoordinates(olCoordinates);
  }
}
