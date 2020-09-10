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

import {Catalog, Feature} from '../../../catalog';
import {CatalogUI} from '../../catalog';
import {VisibleFeatures} from '../index';
import {merge} from 'rxjs';
import {debounceTime, map} from 'rxjs/operators';
import log from '../../../log';

const DEBOUNCE_DELAY = 250;
export const visibleFeaturesFactory = (catalog: Catalog, catalogUI: CatalogUI): VisibleFeatures => {
  const findFeatures = () => {
    const features = [] as Feature[];
    for (const category of Array.from(catalog.categories)) {
      if (catalogUI.isVisible(category.id)) {
        for (const route of Array.from(category.routes)) {
          if (catalogUI.isVisible(route.id)) {
            for (const feature of Array.from(route.features)) {
              if (catalogUI.isVisible(feature.id)) {
                features.push(feature);
              }
            }
          }
        }
      }
    }
    return features;
  };
  let features = findFeatures();

  return {
    get lastFeatures() {
      return features;
    },
    length: features.length,
    observableDebounced() {
      return merge(
        catalog.featuresObservable(),
        catalogUI.visibleObservable(),
      ).pipe(
        debounceTime(DEBOUNCE_DELAY),
        map(() => {
          features = findFeatures();
          return this;
        }),
      );
    },
    observable() {
      return merge(
        catalog.featuresObservable(),
        catalogUI.visibleObservable(),
      ).pipe(map(() => {
        features = findFeatures();
        return this;
      }));
    },
    [Symbol.iterator](): Iterator<Feature> {
      const _features = [...features];
      let _current = 0;
      return {
        next: () => _current >= _features.length
          ? {done: true, value: null}
          : {done: false, value: _features[_current++]},
      };
    },
  };
};
