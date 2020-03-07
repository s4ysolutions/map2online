import {Observable} from 'rxjs';
import {Category, Feature, FeatureProps, ID, Route, RouteProps} from '../../catalog';

export interface CatalogUI {
  selectedCategory: Category;
  selectedCategoryObservable: () => Observable<Category>;
  selectedRoute: Route;
  selectedRouteObservable: () => Observable<Route>;
  activeCategory: Category | null;
  activeCategoryObservable: () => Observable<Category | null>;
  activeRoute: Route | null;
  activeRouteObservable: () => Observable<Route | null>;

  isOpen: (id: ID) => boolean;
  setOpen: (id: ID, open: boolean) => void;
  openObservable: (id: ID) => Observable<boolean>;
  isVisible: (id: ID) => boolean;
  setVisible: (id: ID, open: boolean) => void;
  visibleObservable: (id: ID) => Observable<boolean>;

  readonly categoryEdit: Category | null;
  categoryEditObservable: () => Observable<Category | null>;
  startEditCategory: (category: Category | null) => Category;
  cancelEditCategory: () => void;
  commitEditCategory: () => Promise<Category>;
  readonly categoryDelete: Category | null;
  categoryDeleteObservable: () => Observable<Category | null>;
  requestDeleteCategory: (category: Category) => void;
  endDeleteCategory: () => void;
  readonly routeEdit: RouteProps | null;
  routeEditObservable: Observable<RouteProps> | null;
  startEditRoute: (route: Route | null) => RouteProps;
  cancelEditRoute: () => void;
  commitEditRoute: () => Promise<Route>;
  readonly featureEdit: FeatureProps | null;
  featureEditObservable: Observable<FeatureProps> | null;
  startEditFeature: (feature: Feature | null) => FeatureProps;
  cancelEditFeature: () => void;
  commitEditFeature: () => Promise<Feature>;
}