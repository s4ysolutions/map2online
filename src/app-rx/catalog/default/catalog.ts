import {categoriesFactory, CATEGORY_ID_PREFIX, categoryFactory} from './category';
import {KV} from '../../../kv-rx';
import {Catalog, Category, CategoryProps, Feature, FeatureProps, ID, Route, RouteProps} from '../index';
import {ROUTE_ID_PREFIX, routeFactory} from './route';
import {FEATURE_ID_PREFIX, featureFactory, FEATURES_ID_PREFIX} from './feature';
import {filter, map} from 'rxjs/operators';
import {Wording} from '../../personalization/wording';

const categories: Record<ID, Category> = {};
const routes: Record<ID, Route> = {};
const features: Record<ID, Feature> = {};
const catalogFactory = (storage: KV, wording: Wording): Catalog => {
  const th: Catalog = {
    featuresObservable: () =>
      storage
        .observable<{ key: String; value: any }>()
        .pipe(
          filter(({key}) => key.indexOf(FEATURES_ID_PREFIX) === 0),
          map(({value}) => value)),
    categories: null,
    categoryById: function (id: ID) {
      return categories[id] || categoryFactory(storage, this, wording, storage.get<CategoryProps | null>(`${CATEGORY_ID_PREFIX}@${id}`, null))
    },
    featureById: function (id: ID) {
      return features[id] || featureFactory(storage, this, storage.get<FeatureProps | null>(`${FEATURE_ID_PREFIX}@${id}`, null))
    },
    routeById: function (id: ID) {
      return routes[id] || routeFactory(storage, this, wording, storage.get<RouteProps | null>(`${ROUTE_ID_PREFIX}@${id}`, null))
    }
  };
  th.categories = categoriesFactory(storage, th, wording);
  return th;
};

export default catalogFactory;
