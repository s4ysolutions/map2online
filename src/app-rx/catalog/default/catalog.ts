import {categoriesFactory, CATEGORY_ID_PREFIX, categoryFactory} from './category';
import {KV} from '../../../kv-rx';
import {Catalog, Category, CategoryProps, Feature, FeatureProps, ID, Route, RouteProps} from '../index';
import {ROUTE_ID_PREFIX, routeFactory} from './route';
import {FEATURE_ID_PREFIX, featureFactory} from './feature';

const categories: Record<ID, Category> = {};
const routes: Record<ID, Route> = {};
const features: Record<ID, Feature> = {};

const catalogFactory = (storage: KV): Catalog => {
  const th: Catalog = {
    categories: null,
    categoryById: function (id: ID) {
      return categories[id] || categoryFactory(storage, this, storage.get<CategoryProps | null>(`${CATEGORY_ID_PREFIX}@${id}`, null))
    },
    featureById: function (id: ID) {
      return features[id] || featureFactory(storage, storage.get<FeatureProps | null>(`${FEATURE_ID_PREFIX}@${id}`, null))
    },
    routeById: function (id: ID) {
      return routes[id] || routeFactory(storage, this, storage.get<RouteProps | null>(`${ROUTE_ID_PREFIX}@${id}`, null))
    },
  };
  th.categories = categoriesFactory(storage, th);
  return th;
};

export default catalogFactory;
