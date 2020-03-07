import {KV} from '../../../kv-rx';
import {CatalogUI} from './index';
import {Catalog, Category, Feature, ID, Route} from '../../catalog';
import {map} from 'rxjs/operators';
import {merge, Subject} from 'rxjs';

const catalogUiFactory = (storage: KV, catalog: Catalog): CatalogUI => {
  let categoryEdit: Category | null;
  let routeEdit: Route | null;
  let featureEdit: Feature | null;
  const categoryEditSubject = new Subject<Category | null>();
  const categoryDeleteSubject = new Subject<Category | null>();
  // noinspection UnnecessaryLocalVariableJS
  const th: CatalogUI = {
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
      const activeRoute = this.activeRoute;
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
    //storage.observable<ID | null>('ar').pipe(map(id => id === null ? null : catalog.routeById(id))),
    get activeRoute() {
      const id = storage.get<ID | null>('ar', null);
      if (!id) return null;
      return catalog.routeById(id);
    },
    set activeRoute(value) {
      storage.set('ar', value === null ? null : value.id);
    },
    activeRouteObservable: () => storage.observable<ID | null>('ar').pipe(map(id => id === null ? null : catalog.routeById(id))),

    isVisible: (id: ID) => storage.get<boolean>(`vis@${id}`, false),
    setVisible: (id: ID, open: boolean) => storage.set(`vis@${id}`, open),
    visibleObservable: (id: ID) => storage.observable<boolean>(`vis@${id}`),

    isOpen: (id: ID) => storage.get<boolean>(`op@${id}`, false),
    setOpen: (id: ID, open: boolean) => storage.set(`op@${id}`, open),
    openObservable: (id: ID) => storage.observable<boolean>(`op@${id}`),

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
      return Promise.resolve(id === null ? null : this.categoryById(id));
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
    routeEditObservable: new Subject<Route | null>(),
    startEditRoute: function (route: Route | null) {
      return undefined;
    },
    commitEditRoute: function () {
      const id = routeEdit && routeEdit.id;
      routeEdit = null;
      (this.routeEditObservable as Subject<Route>).next(null);
      return Promise.resolve(id === null ? null : this.routeById(id));
    },
    cancelEditRoute: function () {
      categoryEdit = null;
      (this.categoryEditObservable as Subject<Route>).next(null)
    },

    featureEdit: null,
    featureEditObservable: new Subject<Feature | null>(),
    startEditFeature: function (feature: Feature | null) {
      return undefined;
    },
    commitEditFeature: function () {
      return undefined;
    },
    cancelEditFeature: function () {
    }
  };
  th.endDeleteCategory = th.endDeleteCategory.bind(th);
  return th;
};

export default catalogUiFactory;