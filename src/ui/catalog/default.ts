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

import {KV} from '../../kv/sync';
import {CatalogUI} from './index';
import {Catalog, Category, Feature, ID, Route} from '../../catalog';
import {map} from 'rxjs/operators';
import {Subject, merge} from 'rxjs';

const catalogUIFactory = (storage: KV, catalog: Catalog): CatalogUI => {
  const categoryEditSubject = new Subject<Category | null>();
  const categoryDeleteSubject = new Subject<Category | null>();
  const routeEditSubject = new Subject<Route | null>();
  const routeDeleteSubject = new Subject<{ route: Route, category: Category } | null>();
  const featureEditSubject = new Subject<Feature | null>();
  const featureDeleteSubject = new Subject<{ feature: Feature, route: Route } | null>();
  let categoryEdit: Category | null = null;
  let categoryDelete: Category | null = null;
  let routeEdit: Route | null = null;
  let routeDelete: { route: Route; category: Category } | null = null;
  let featureEdit: Feature | null = null;
  let featureDelete: { feature: Feature; route: Route } | null = null;
  // noinspection UnnecessaryLocalVariableJS
  const th: CatalogUI & { getStoredActiveRoute: () => Route | null } = {
    get selectedCategory() {
      const id = storage.get<ID | null>('sc', null);
      if (!id) {
        return null;
      }
      return catalog.categoryById(id);
    },
    set selectedCategory(value) {
      storage.set('sc', value === null ? null : value.id);
    },
    selectedCategoryObservable: () => merge(
      storage.observable<ID | null>('sc').pipe(map(id => id === null ? null : catalog.categoryById(id))),
      storage.observableDelete<null>('sc').pipe(map(() => null)),
    ),
    get selectedRoute() {
      const id = storage.get<ID | null>('sr', null);
      return (id === null) ? null : catalog.routeById(id);
    },
    set selectedRoute(value) {
      storage.set('sr', value === null ? null : value.id);
    },
    selectedRouteObservable: () => merge(
      storage.observable<ID | null>('sr').pipe(map(id => id === null ? null : catalog.routeById(id))),
      storage.observableDelete<null>('sr').pipe(map(() => null)),
    ),
    get activeCategory() {
      const activeRoute = this.getStoredActiveRoute();
      if (activeRoute) {
        for (const category of catalog.categories) {
          if (category.routes.has(activeRoute)) {
            return category;
          }
        }
      }
      if (catalog.categories.length > 0) {
        return catalog.categories.byPos(0);
      }
      return null;

    },
    set activeCategory(category) {
      const {activeRoute} = this;
      if (category !== null) {
        if ((activeRoute === null || !category.routes.has(activeRoute)) && category.routes.length > 0) {
          this.activeRoute = category.routes.byPos(0);
        }
      }
    },
    activeCategoryObservable() {
      return merge(
        this.activeRouteObservable(),
        catalog.categories.observable(),
      ).pipe(map(() => this.activeCategory));
    },
    getStoredActiveRoute() {
      const id = storage.get<ID | null>('ar', null);
      if (id) {
        const activeRoute = catalog.routeById(id);
        if (activeRoute) {
          return activeRoute;
        }
      }

      return null;
    },
    get activeRoute() {
      const activeRoute = this.getStoredActiveRoute();
      if (activeRoute) {
        return activeRoute;
      }

      // expected to return catalog.categories[0]
      const {activeCategory} = this;
      if (!activeCategory || !activeCategory.routes || activeCategory.routes.length < 1) {
        return null;
      }

      return activeCategory.routes.byPos(0);
    },
    set activeRoute(value) {
      storage.set('ar', value === null ? null : value.id);
    },
    activeRouteObservable: () => storage.observable<ID | null>('ar').pipe(map(id => id === null ? null : catalog.routeById(id))),
    get activeFeature() {
      const id = storage.get<ID | null>('ar', null);
      if (!id) {
        return null;
      }
      return catalog.featureById(id);
    },
    set activeFeature(value) {
      storage.set('ar', value === null ? null : value.id);
    },
    activeFeatureObservable: () => storage.observable<ID | null>('af').pipe(map(id => id === null ? null : catalog.featureById(id))),

    isOpen: (id: ID) => storage.get<boolean>(`op@${id}`, false),
    setOpen: (id: ID, open: boolean) => storage.set(`op@${id}`, open),
    openObservable: (id: ID) => storage.observable<boolean>(`op@${id}`)
      .pipe(map(v => Boolean(v))),

    get categoryEdit(): Category | null {
      return categoryEdit;
    },
    categoryEditObservable: () => categoryEditSubject,
    startEditCategory(category: Category): Category {
      categoryEdit = category;
      categoryEditSubject.next(category);
      return category;
    },
    commitEditCategory() {
      const id = this.categoryEdit && this.categoryEdit.id || null;
      categoryEdit = null;
      categoryEditSubject.next(null);
      return Promise.resolve(id === null ? null : catalog.categoryById(id));
    },
    cancelEditCategory() {
      categoryEdit = null;
      categoryEditSubject.next(null);
    },

    get categoryDelete() {
      return categoryDelete;
    },
    categoryDeleteObservable: () => categoryDeleteSubject,
    requestDeleteCategory(category: Category) {
      categoryDelete = category;
      categoryDeleteSubject.next(category);
    },
    endDeleteCategory() {
      categoryDelete = null;
      categoryDeleteSubject.next(null);
    },

    get routeEdit() {
      return routeEdit;
    },
    routeEditObservable: () => routeEditSubject,
    startEditRoute(route: Route) {
      routeEdit = route;
      routeEditSubject.next(route);
      return route;
    },
    commitEditRoute() {
      const id = this.routeEdit && this.routeEdit.id || null;
      routeEdit = null;
      routeEditSubject.next(null);
      return Promise.resolve(id === null ? null : catalog.routeById(id));
    },
    cancelEditRoute() {
      routeEdit = null;
      routeEditSubject.next(null);
    },
    get routeDelete() {
      return routeDelete;
    },
    routeDeleteObservable: () => routeDeleteSubject,
    requestDeleteRoute(route: Route, category: Category) {
      routeDelete = {route, category};
      routeDeleteSubject.next({route, category});
    },
    endDeleteRoute() {
      routeDelete = null;
      routeDeleteSubject.next(null);
    },
    get featureEdit() {
      return featureEdit;
    },
    featureEditObservable: () => featureEditSubject,
    startEditFeature(feature: Feature) {
      featureEdit = feature;
      featureEditSubject.next(feature);
      return feature;
    },
    commitEditFeature() {
      const id = this.featureEdit && this.featureEdit.id || null;
      featureEdit = null;
      featureEditSubject.next(null);
      return Promise.resolve(id === null ? null : catalog.featureById(id));
    },
    cancelEditFeature() {
      featureEdit = null;
      featureEditSubject.next(null);
    },

    get featureDelete() {
      return featureDelete;
    },
    featureDeleteObservable: () => featureDeleteSubject,
    requestDeleteFeature(feature: Feature, route: Route) {
      featureDelete = {feature, route};
      featureDeleteSubject.next({feature, route});
    },
    endDeleteFeature() {
      featureDelete = null;
      featureDeleteSubject.next(null);
    },
  };
  th.endDeleteCategory = th.endDeleteCategory.bind(th);
  th.endDeleteRoute = th.endDeleteRoute.bind(th);
  th.endDeleteFeature = th.endDeleteFeature.bind(th);
  return th;
};

export default catalogUIFactory;
