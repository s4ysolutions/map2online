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

import {Observable} from 'rxjs';
import {Category, Feature, ID, Route} from '../../catalog';

export interface CatalogUI {
  selectedCategory: Category | null;
  selectedCategoryObservable: () => Observable<Category | null>;
  selectedRoute: Route | null;
  selectedRouteObservable: () => Observable<Route | null>;
  activeCategory: Category | null;
  activeCategoryObservable: () => Observable<Category | null>;
  activeRoute: Route | null;
  activeRouteObservable: () => Observable<Route | null>;
  activeFeature: Feature | null;
  activeFeatureObservable: () => Observable<Feature | null>;

  isOpen: (id: ID) => boolean;
  setOpen: (id: ID, open: boolean) => void;
  openObservable: (id: ID) => Observable<boolean>;

  readonly categoryEdit: Category | null;
  categoryEditObservable: () => Observable<Category | null>;
  startEditCategory: (category: Category) => Category;
  cancelEditCategory: () => void;
  commitEditCategory: () => Promise<Category | null>;

  readonly categoryDelete: Category | null;
  categoryDeleteObservable: () => Observable<Category | null>;
  requestDeleteCategory: (category: Category) => void;
  endDeleteCategory: () => void;

  readonly routeEdit: Route | null;
  routeEditObservable: () => Observable<Route | null>;
  startEditRoute: (route: Route) => Route;
  cancelEditRoute: () => void;
  commitEditRoute: () => Promise<Route | null>;

  readonly routeDelete: { route: Route; category: Category } | null;
  routeDeleteObservable: () => Observable<{ route: Route; category: Category } | null>;
  requestDeleteRoute: (route: Route, category: Category) => void;
  endDeleteRoute: () => void;

  readonly featureEdit: Feature | null;
  featureEditObservable: () => Observable<Feature | null>;
  startEditFeature: (feature: Feature) => Feature;
  cancelEditFeature: () => void;
  commitEditFeature: () => Promise<Feature | null>;

  readonly featureDelete: { feature: Feature; route: Route } | null;
  featureDeleteObservable: () => Observable<{ feature: Feature; route: Route } | null>;
  requestDeleteFeature: (feature: Feature, route: Route) => void;
  endDeleteFeature: () => void;

  showFeature: (feature: Feature) => void;
}
