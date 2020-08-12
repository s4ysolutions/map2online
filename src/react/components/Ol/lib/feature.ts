import {Feature, ID, isPoint} from '../../../../app-rx/catalog';
import LineString from 'ol/geom/LineString';
import OlFeature from 'ol/Feature';
import Point from 'ol/geom/Point';
import {getStyle} from './styles';
import {FeatureType} from '../../../../app-rx/ui/tools';

const cache: Record<ID, OlFeature> = {};

export const olFeatureFactory = (feature: Feature): OlFeature => {
  let cached = cache[feature.id];
  console.log('debug olFeatureFactory enter', feature.title, feature.id, cached)
  if (cached) return cached;

  const geometry = isPoint(feature.geometry)
    ? new Point([feature.geometry.coordinate.lon + 1, feature.geometry.coordinate.lat + 2])
    : new LineString(feature.geometry.coordinates.map(c => [c.lon, c.lat]));

  cached = new OlFeature({
    color: feature.color,
    geometry,
    id: feature.id,
    name: 'test',
  });
  cached.setId(feature.id);
  cached.set('color', feature.color);
  console.log('debug olFeatureFactory', feature.title)
  cached.setStyle(getStyle(isPoint(feature.geometry) ? FeatureType.Point : FeatureType.Line, feature.color, feature.title || feature.id));

  // cached = new OlFeature(geometry);
  cache[feature.id] = cached;
  return cached;
};
