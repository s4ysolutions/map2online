import {KV} from '../../../kv-rx';
import {CatalogUI} from './index';
import {Catalog, Category, Feature, ID, Route} from '../../catalog';
import {filter, map} from 'rxjs/operators';
import {merge, Subject} from 'rxjs';

const catalogUIFactory = (storage: KV, catalog: Catalog): CatalogUI => {
  const categoryEditSubject = new Subject<Category | null>();
  const categoryDeleteSubject = new Subject<Category | null>();
  const routeEditSubject = new Subject<Route | null>();
  const routeDeleteSubject = new Subject<{ route: Route, category: Category } | null>();
  const featureEditSubject = new Subject<Feature | null>();
  const featureDeleteSubject = new Subject<{ feature: Feature, route: Route } | null>();
  // noinspection UnnecessaryLocalVariableJS
  const th: CatalogUI & { getStoredActiveRoute: () => Route } = {
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
    selectedCategoryObservable: () => storage.observable<ID | null>('sc').pipe(map(id => id === null ? null : catalog.categoryById(id))),
    get selectedRoute() {
      const id = storage.get<ID | null>('sr', null);
      if (!id) {
        return null;
      }
      return catalog.routeById(id);
    },
    set selectedRoute(value) {
      storage.set('sr', value === null ? null : value.id);
    },
    selectedRouteObservable: () => storage.observable<ID | null>('sr').pipe(map(id => id === null ? null : catalog.routeById(id))),

    get activeCategory() {
      const activeRoute = this.getStoredActiveRoute();
      if (activeRoute) {
        for (const category of Array.from(catalog.categories)) {
          if (category.hasRoute(activeRoute)) {
            return category;
          }
        }
      }
      if (catalog.categories.length > 0) {
        return catalog.categories.byPos(0);
      } else {
        return null;
      }
    },
    set activeCategory(category) {
      const activeRoute = this.activeRoute;
      if (!category.hasRoute(activeRoute) && category.routes.length > 0) {
        this.activeRoute = category.routes.byPos(0);
      }
    },
    activeCategoryObservable() {
      return merge(
        this.activeRouteObservable(),
        catalog.categories.observable(),
      ).pipe(map(() => this.activeCategory))
    },
    getStoredActiveRoute: () => {
      const id = storage.get<ID | null>('ar', null);
      if (id) {
        const activeRoute = catalog.routeById(id);
        if (activeRoute)
          return activeRoute
      }

      return null
    },
    get activeRoute() {
      const activeRoute = this.getStoredActiveRoute()
      if (activeRoute) {
        return activeRoute;
      }

      // expected to return catalog.categories[0]
      const activeCategory = this.activeCategory
      if (!activeCategory || !activeCategory.routes || activeCategory.routes.length < 1) {
        return null
      }

      return activeCategory.routes.byPos(0)
    },
    set activeRoute(value) {
      storage.set('ar', value === null ? null : value.id);
    },
    activeRouteObservable: () => storage.observable<ID | null>('ar').pipe(map(id => id === null ? null : catalog.routeById(id))),
    get activeFeature() {
      const id = storage.get<ID | null>('ar', null);
      if (!id) return null;
      return catalog.featureById(id);
    },
    set activeFeature(value) {
      storage.set('ar', value === null ? null : value.id);
    },
    activeFeatureObservable: () => storage.observable<ID | null>('af').pipe(map(id => id === null ? null : catalog.featureById(id))),

    isVisible: (id: ID) => storage.get<boolean>(`vis@${id}`, true),
    setVisible: (id: ID, open: boolean) => storage.set(`vis@${id}`, open),
    visibleObservable: (id?: ID) => id
      ? storage.observable<boolean>(`vis@${id}`)
        .pipe(
          map(v => v === null ? true : v)
        )
      : storage.observable<{ key: string; value: any }>()
        .pipe(
          filter(kv => kv.key.indexOf('vis') === 0),
          map(kv => kv.value === null ? true : kv.value)
        ),
    isOpen: (id: ID) => storage.get<boolean>(`op@${id}`, false),
    setOpen: (id: ID, open: boolean) => storage.set(`op@${id}`, open),
    openObservable: (id: ID) => storage.observable<boolean>(`op@${id}`)
      .pipe(
        map(v => !!v)
      ),

    categoryEdit: null,
    categoryEditObservable: () => categoryEditSubject,
    startEditCategory: function (category: Category | null) {
      this.categoryEdit = category;
      categoryEditSubject.next(category);
      return category;
    },
    commitEditCategory: function () {
      const id = this.categoryEdit && this.categoryEdit.id;
      this.categoryEdit = null;
      categoryEditSubject.next(null);
      return Promise.resolve(id === null ? null : catalog.categoryById(id));
    },
    cancelEditCategory: function () {
      this.categoryEdit = null;
      categoryEditSubject.next(null)
    },

    categoryDelete: null,
    categoryDeleteObservable: () => categoryDeleteSubject,
    requestDeleteCategory: function (category: Category) {
      this.categoryDelete = category;
      categoryDeleteSubject.next(category);
    },
    endDeleteCategory: function () {
      this.categoryDelete = null;
      categoryDeleteSubject.next(null);
    },

    routeEdit: null,
    routeEditObservable: () => routeEditSubject,
    startEditRoute: function (route: Route | null) {
      this.routeEdit = route;
      routeEditSubject.next(route);
      return route;
    },
    commitEditRoute: function () {
      const id = this.routeEdit && this.routeEdit.id;
      this.routeEdit = null;
      routeEditSubject.next(null);
      return Promise.resolve(id === null ? null : catalog.routeById(id));
    },
    cancelEditRoute: function () {
      this.routeEdit = null;
      routeEditSubject.next(null)
    },

    routeDelete: null,
    routeDeleteObservable: () => routeDeleteSubject,
    requestDeleteRoute: function (route: Route, category: Category) {
      this.routeDelete = {route, category};
      routeDeleteSubject.next({route, category});
    },
    endDeleteRoute: function () {
      this.routeDelete = null;
      routeDeleteSubject.next(null);
    },

    featureEdit: null,
    featureEditObservable: () => featureEditSubject,
    startEditFeature: function (feature: Feature | null) {
      this.featureEdit = feature;
      featureEditSubject.next(feature);
      return feature;
    },
    commitEditFeature: function () {
      const id = this.featureEdit && this.featureEdit.id;
      this.featureEdit = null;
      featureEditSubject.next(null);
      return Promise.resolve(id === null ? null : catalog.featureById(id));
    },
    cancelEditFeature: function () {
      this.featureEdit = null;
      featureEditSubject.next(null)
    },

    featureDelete: null,
    featureDeleteObservable: () => featureDeleteSubject,
    requestDeleteFeature: function (feature: Feature, route: Route) {
      this.featureDelete = {feature, route};
      featureDeleteSubject.next({feature, route});
    },
    endDeleteFeature: function () {
      this.featureDelete = null;
      featureDeleteSubject.next(null);
    },
  };
  th.endDeleteCategory = th.endDeleteCategory.bind(th);
  th.endDeleteRoute = th.endDeleteRoute.bind(th);
  th.endDeleteFeature = th.endDeleteFeature.bind(th);
  return th;
};

export default catalogUIFactory;