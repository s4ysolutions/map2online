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

import {categoriesFactory, CATEGORY_ID_PREFIX, categoryFactory} from '../default/category';
import {KV} from '../../kv/sync';
import {Catalog, Category, CategoryProps, Feature, FeatureProps, ID, Route, RouteProps} from '../index';
import {ROUTE_ID_PREFIX, routeFactory} from '../default/route';
import {FEATURE_ID_PREFIX, featureFactory} from '../default/feature';
import {debounceTime} from 'rxjs/operators';
import {Wording} from '../../personalization/wording';
import {Map2Styles} from '../../style';
import {Observable, Subject} from 'rxjs';
import {KvPromise} from '../../kv/promise';
import {CatalogStorage} from '../storage';

const DEBOUNCE_DELAY = 250;
// const FEATURE_ID_PREFIX_AT = `${FEATURE_ID_PREFIX}@`;

const CATEGORIES_ID_PREFIX = 'cats';
const ROUTE_ID_PREFIX = 'r';
const ROUTES_ID_PREFIX = 'rs';

const catalogPromiseFactory = async (kv: KvPromise, storage: CatalogStorage, wording: Wording, styles: Map2Styles): Promise<Catalog> => {
  const categoriesCache: Record<ID, Category> = {};
  const routesCache: Record<ID, Route> = {};
  const featuresCache: Record<ID, Feature> = {};
  const categoriesIds: Record<ID, ID[]> = {};
  const routesIds: Record<ID, ID[]> = {};
  const featuresIds: Record<ID, ID[]> = {};

  let promises: Promise<{key: ID,ids: ID[]}>[]
  promises = []
  for (const id of ['root']) {
    const key: ID = `${CATEGORIES_ID_PREFIX}@${id}`
    promises.push(
      kv.get<ID[]>(key, [])
        .then(ids => ({key, ids}))
    );
  }

  for (const e of (await Promise.all(promises))){
    categoriesIds[e.key] = e.ids;
  }

  categoriesIds[CATEGORIES_ID_PREFIX] = await kv.get<ID[]>(CATEGORIES_ID_PREFIX, []);
  promises = []
  for (const id of categoriesIds[CATEGORIES_ID_PREFIX]) {
    kv.`${CATEGORY_ID_PREFIX}@${id}`
    promises.push()
  }

  const promisesRoutesIds: Promise<ID[]>[] = [];
  for (const routeIds )


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

  const subjectVisibleFeatures = new Subject<Feature[]>();
  const observableVisisbleFeaturesDebounced = subjectVisibleFeatures.pipe(debounceTime(DEBOUNCE_DELAY));
  let lastVisibleFeatures: Feature[] = [];

  const th: Catalog = {
    categories: null,
    categoryById(id: ID) {
      const category = categories[id];
      if (category) {
        return category;
      }
      // eslint-disable-next-line no-use-before-define
      categories[id] = categoryFactory(kv, this, wording, styles, routesIds, featuresIds, kv.get<CategoryProps | null>(`${CATEGORY_ID_PREFIX}@${id}`, null), notifyFeaturesVisibility);
      return categories[id];
    },
    featureById(id: ID) {
      const feature = features[id];
      if (feature) {
        return feature;
      }
      // eslint-disable-next-line no-use-before-define
      features[id] = featureFactory(kv, this, kv.get<FeatureProps | null>(`${FEATURE_ID_PREFIX}@${id}`, null), styles, notifyFeaturesVisibility);
      return features[id];
    },
    routeById(id: ID) {
      const route = routes[id];
      if (route) {
        return route;
      }
      // eslint-disable-next-line no-use-before-define
      routes[id] = routeFactory(kv, this, wording, styles, featuresIds, kv.get<RouteProps | null>(`${ROUTE_ID_PREFIX}@${id}`, null), notifyFeaturesVisibility);
      return routes[id];
    },
    get visibleFeatures() {
      return lastVisibleFeatures;
    },
    visibleFeaturesObservable: (debounce: boolean | undefined): Observable<Feature[]> =>
      debounce ? observableVisisbleFeaturesDebounced : subjectVisibleFeatures,
  };

  const findVisibleFeatures = (): Feature[] => {
    const ret = [] as Feature[];
    for (const category of th.categories) {
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
  };

  const notifyFeaturesVisibility = (): void => {
    lastVisibleFeatures = findVisibleFeatures();
    subjectVisibleFeatures.next(lastVisibleFeatures);
  };

  th.categories = categoriesFactory(kv, th, wording, styles, routesIds, featuresIds, notifyFeaturesVisibility);

  // NOTE: a bit fragile. As a side effect it will create a first category with first router
  //       if none exists yet.
  lastVisibleFeatures = findVisibleFeatures();
  return th;
};

export default catalogFactory;
