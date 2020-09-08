/*
 * Copyright 2019 s4y.solutions
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {CATEGORY_ID_PREFIX, categoriesFactory, categoryFactory} from './category';
import {KV} from '../../kv-rx';
import {Catalog, Category, CategoryProps, Feature, FeatureProps, Features, ID, Route, RouteProps} from '../index';
import {ROUTE_ID_PREFIX, routeFactory} from './route';
import {FEATURES_ID_PREFIX, FEATURE_ID_PREFIX, featureFactory} from './feature';
import {filter, map} from 'rxjs/operators';
import {Wording} from '../../personalization/wording';

const categories: Record<ID, Category> = {};
const routes: Record<ID, Route> = {};
const features: Record<ID, Feature> = {};
const catalogFactory = (storage: KV, wording: Wording): Catalog => {
  const th: Catalog = {
    featuresObservable: () =>
      storage
        .observable<{ key: string; value: Features }>()
        .pipe(
          filter(({key}) => key.indexOf(FEATURES_ID_PREFIX) === 0),
          map(({value}) => value),
        ),
    categories: null,
    categoryById(id: ID) {
      const category = categories[id];
      if (category) {
        return category;
      }
      categories[id] = categoryFactory(storage, this, wording, storage.get<CategoryProps | null>(`${CATEGORY_ID_PREFIX}@${id}`, null));
      return categories[id];
    },
    featureById(id: ID) {
      const feature = features[id];
      if (feature) {
        return feature;
      }
      features[id] = featureFactory(storage, this, storage.get<FeatureProps | null>(`${FEATURE_ID_PREFIX}@${id}`, null));
      return features[id];
    },
    routeById(id: ID) {
      const route = routes[id];
      if (route) {
        return route;
      }
      routes[id] = routeFactory(storage, this, wording, storage.get<RouteProps | null>(`${ROUTE_ID_PREFIX}@${id}`, null));
      return routes[id];
    },
  };
  th.categories = categoriesFactory(storage, th, wording);
  return th;
};

export default catalogFactory;
