import {Catalog} from '../../../catalog';
import {CatalogUI} from '../../catalog';
import {Designer} from '../index';
import {visibleFeaturesFactory} from './features';

export const designerFactory = (catalog: Catalog, catalogUI: CatalogUI): Designer => ({
  visibleFeatures: visibleFeaturesFactory(catalog, catalogUI),
});