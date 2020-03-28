import {Feature, ID, isPoint} from '../../../../app-rx/catalog';
import LineString from 'ol/geom/LineString';
import OlFeature from 'ol/Feature';
import Point from 'ol/geom/Point';
import {getStyle} from './styles';
import {FeatureType} from '../../../../app-rx/ui/tools';

const cache: Record<ID, OlFeature> = {};

export const olFeatureFactory = (feature: Feature): OlFeature => {
  console.log('dbg olFeatureFactory', feature);
  let cached = cache[feature.id];
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
  cached.setStyle(getStyle(isPoint(feature.geometry) ? FeatureType.Point : FeatureType.Line, feature.color));

  // cached = new OlFeature(geometry);
  cache[feature.id] = cached;
  return cached;
};
