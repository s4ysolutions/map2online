/* eslint-disable no-unused-vars */
import {CategoryProps, FeatureProps, ID, RouteProps} from '../index';
import {Observable} from 'rxjs';

export interface CatalogStorage {
  readFeatureProps(id: ID): Promise<FeatureProps | null>;

  updateFeatureProps(props: FeatureProps): Promise<void>;

  deleteFeatureProps(props: FeatureProps): Promise<void>;

  observableFeatureProps(props: FeatureProps): Observable<FeatureProps | null>;

  readFeaturesIds(routeId: ID): Promise<ID[] | null>;

  updateFeaturesIds(routeId: ID, ids: ID[]): Promise<void>;

  deleteFeaturesIds(routeId: ID): Promise<Array<ID> | null>;

  observableFeaturesIds(routeId: ID): Observable<ID[] | null>;

  readRouteProps(id: ID): Promise<RouteProps | null>;

  updateRouteProps(props: RouteProps): Promise<void>;

  deleteRouteProps(props: RouteProps): Promise<RouteProps | null>;

  observableRouter(props: RouteProps): Observable<RouteProps | null>;

  readRoutesIds(categoryId: ID): Promise<ID[] | null>;

  updateRoutesIds(categoryId: ID, ids: ID[]): Promise<void>;

  deleteRoutesIds(categoryId: ID): Promise<Array<ID> | null>;

  observableRoutesIds(categoryId: ID): Observable<ID[] | null>;

  readCategoryProps(id: ID): Promise<CategoryProps | null>;

  updateCategoryProps(props: CategoryProps): Promise<void>;

  deleteCategoryProps(props: CategoryProps): Promise<CategoryProps | null>;

  observableCategoryProps(props: CategoryProps): Observable<CategoryProps | null>;

  readCategoriesIds(catalogId: ID): Promise<ID[] | null>;

  updateCategoriesIds(catalogId: ID, ids: ID[]): Promise<void>;

  deleteCategoriesIds(catalogId: ID): Promise<Array<ID> | null>;

  observableCategoriesIds(catalogId: ID): Observable<ID[] | null>;
}
