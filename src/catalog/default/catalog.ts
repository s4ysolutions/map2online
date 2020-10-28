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
import {FEATURE_ID_PREFIX, featureFactory} from './feature';
import {debounceTime, filter, map} from 'rxjs/operators';
import {Wording} from '../../personalization/wording';
import {Map2Styles} from '../../style';
import {Observable} from 'rxjs';

const DEBOUNCE_DELAY = 250;

const FEATURE_ID_PREFIX_AT = `${FEATURE_ID_PREFIX}@`;

const catalogFactory = (storage: KV, wording: Wording, styles: Map2Styles): Catalog => {
  const categories: Record<ID, Category> = {};
  const routes: Record<ID, Route> = {};
  const features: Record<ID, Feature> = {};
  const routesIds: Record<ID, ID[]> = {};
  const featuresIds: Record<ID, ID[]> = {};

  const lastFeatures: Feature[] = null;
  // noinspection JSUnusedLocalSymbols
  // eslint-disable-next-line no-unused-vars,@typescript-eslint/no-unused-vars
  const isNew = (newFeatures: Feature[]): boolean => {
    if (lastFeatures === null) {
      return true;
    }
    if (lastFeatures.length !== newFeatures.length) {
      return true;
    }
    for (let i = 0; i < newFeatures.length; i++) {
      if (!lastFeatures[i].eq(newFeatures[i])) {
        return false;
      }
    }
    return true;
  };

  const th: Catalog = {
    featuresObservable: () =>
      storage
        .observable<{ key: string; value: Features }>()
        .pipe(
          filter(({key}) => key.indexOf(FEATURE_ID_PREFIX_AT) === 0),
          map(({value}) => value),
        ),
    categories: null,
    categoryById(id: ID) {
      const category = categories[id];
      if (category) {
        return category;
      }
      categories[id] = categoryFactory(storage, this, wording, styles, routesIds, featuresIds, storage.get<CategoryProps | null>(`${CATEGORY_ID_PREFIX}@${id}`, null));
      return categories[id];
    },
    featureById(id: ID) {
      const feature = features[id];
      if (feature) {
        return feature;
      }
      features[id] = featureFactory(storage, this, storage.get<FeatureProps | null>(`${FEATURE_ID_PREFIX}@${id}`, null), styles);
      return features[id];
    },
    routeById(id: ID) {
      const route = routes[id];
      if (route) {
        return route;
      }
      routes[id] = routeFactory(storage, this, wording, styles, featuresIds, storage.get<RouteProps | null>(`${ROUTE_ID_PREFIX}@${id}`, null));
      return routes[id];
    },
    get visibleFeatures(): Feature[] {
      const ret = [] as Feature[];
      for (const category of this.categories) {
        if (category.visible) {
          for (const route of category.routes) {
            if (route.visible) {
              for (const feature of route.features) {
                if (feature.visible) {
                  ret.push(feature);
                }
              }
            }
          }
        }
      }
      return ret;
    },
    visibleFeaturesObservable (debounce = true): Observable<Feature[]> {
      return debounce ? this.featuresObservable().pipe(
        debounceTime(DEBOUNCE_DELAY),
        map(() => this.visibleFeatures),
        /*
        does not seem to be effective
        filter((newFeatures: Feature[]) => isNew(newFeatures)),
        tap((newFeatures: Feature[]) => {
          lastFeatures = newFeatures;
        }),
         */
      ) : this.featuresObservable().pipe(map(() => this.visibleFeatures));
    },
  };
  th.categories = categoriesFactory(storage, th, wording, styles, routesIds, featuresIds);
  return th;
};

export default catalogFactory;
