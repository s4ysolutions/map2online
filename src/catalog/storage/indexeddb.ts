import {KvPromise} from '../../kv/promise';
import {CatalogStorage} from './index';
import {CategoryProps, FeatureProps, FeaturePropsWithStyleId, ID, RouteProps} from '../index';
import {Map2Styles} from '../../style';
import {Observable} from 'rxjs';

export const FEATURE_ID_PREFIX = 'f';
export const FEATURES_ID_PREFIX = 'fs';
export const ROUTE_ID_PREFIX = 'r';
export const ROUTES_ID_PREFIX = 'rs';
export const CATEGORY_ID_PREFIX = 'c';
export const CATEGORIES_ID_PREFIX = 'cs';

export class CatalogStorageIndexedDb implements CatalogStorage {
  private readonly kv: KvPromise;

  private readonly map2styles: Map2Styles;

  constructor(kv: KvPromise, map2styles: Map2Styles) {
    this.kv = kv;
    this.map2styles = map2styles;
  }

  deleteFeatureProps(props: FeatureProps): Promise<void> {
    return Promise.all([
      this.kv.delete(`${FEATURE_ID_PREFIX}@${props.id}`),
      this.kv.delete(`vis@${props.id}`), // visibility
      this.kv.delete(`op@${props.id}`), // menu open
    ]) as unknown as Promise<void>;
  }

  observableFeatureProps(props: FeatureProps): Observable<FeatureProps | null> {
    return this.kv.observable<FeatureProps | null>(`${FEATURE_ID_PREFIX}@${props.id}`);
  }

  readFeatureProps(id: ID): Promise<FeatureProps | null> {
    return this.kv.get<FeaturePropsWithStyleId | null>(`${FEATURE_ID_PREFIX}@${id}`, null).then(props => {
      if (props === null) {
        return null;
      }
      const style = props.styleId
        ? (this.map2styles.byId(props.styleId) || this.map2styles.defaultStyle)
        : this.map2styles.defaultStyle;
      // eslint-disable-next-line no-unused-vars,@typescript-eslint/no-unused-vars
      const {styleId: _, ...pp} = props;
      return {...pp, style};
    });
  }

  updateFeatureProps(props: FeatureProps): Promise<void> {
    const map2style = this.map2styles.findEq(props.style) || props.style;
    // const map2style = props.style || this.map2styles.defaultStyle;
    const key = `${FEATURE_ID_PREFIX}@${props.id}`;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {style, ...bean} = props;
    const pp: FeaturePropsWithStyleId = {...bean, styleId: map2style.id};
    return this.kv.set<FeaturePropsWithStyleId>(key, pp);
  }

  readFeaturesIds(routeId: ID): Promise<ID[] | null> {
    const key = `${FEATURES_ID_PREFIX}@${routeId}`;
    return this.kv.get<ID[] | null>(key, null);
  }

  updateFeaturesIds(routeId: ID, ids: ID[]): Promise<void> {
    const key = `${FEATURES_ID_PREFIX}@${routeId}`;
    return this.kv.set<ID[]>(key, ids);
  }

  deleteFeaturesIds(routeId: ID): Promise<Array<ID> | null> {
    const key = `${FEATURES_ID_PREFIX}@${routeId}`;
    return this.kv.delete<Array<ID>>(key);
  }

  observableFeaturesIds(routeId: ID): Observable<ID[] | null> {
    const key = `${FEATURES_ID_PREFIX}@${routeId}`;
    return this.kv.observable<ID[] | null>(key);
  }

  readRouteProps(id: ID): Promise<RouteProps | null> {
    const key = `${ROUTE_ID_PREFIX}@${id}`;
    return this.kv.get<RouteProps | null>(key, null);
  }

  updateRouteProps(props: RouteProps): Promise<void> {
    const key = `${ROUTE_ID_PREFIX}@${props.id}`;
    return this.kv.set(key, props);
  }

  deleteRouteProps(props: RouteProps): Promise<RouteProps | null> {
    const key = `${ROUTE_ID_PREFIX}@${props.id}`;
    return this.kv.delete<RouteProps>(key);
  }

  observableRouter(props: RouteProps): Observable<RouteProps | null> {
    const key = `${ROUTE_ID_PREFIX}@${props.id}`;
    return this.kv.observable<RouteProps | null>(key);
  }

  readRoutesIds(categoryId: ID): Promise<ID[] | null> {
    const key = `${ROUTES_ID_PREFIX}@${categoryId}`;
    return this.kv.get<ID[] | null>(key, null);
  }

  updateRoutesIds(categoryId: ID, ids: ID[]): Promise<void> {
    const key = `${ROUTES_ID_PREFIX}@${categoryId}`;
    return this.kv.set<ID[]>(key, ids);
  }

  deleteRoutesIds(categoryId: ID): Promise<Array<ID> | null> {
    const key = `${ROUTES_ID_PREFIX}@${categoryId}`;
    return this.kv.delete<Array<ID>>(key);
  }

  observableRoutesIds(categoryId: ID): Observable<ID[] | null> {
    const key = `${ROUTES_ID_PREFIX}@${categoryId}`;
    return this.kv.observable<ID[] | null>(key);
  }

  readCategoryProps(id: string): Promise<CategoryProps | null> {
    const key = `${CATEGORY_ID_PREFIX}@${id}`;
    return this.kv.get<CategoryProps | null>(key, null);
  }

  updateCategoryProps(props: CategoryProps): Promise<void> {
    const key = `${CATEGORY_ID_PREFIX}@${props.id}`;
    return this.kv.set(key, props);
  }

  deleteCategoryProps(props: CategoryProps): Promise<CategoryProps | null> {
    const key = `${CATEGORY_ID_PREFIX}@${props.id}`;
    return this.kv.delete<CategoryProps>(key);
  }

  observableCategoryProps(props: CategoryProps): Observable<CategoryProps | null> {
    const key = `${CATEGORY_ID_PREFIX}@${props.id}`;
    return this.kv.observable<CategoryProps | null>(key);
  }

  readCategoriesIds(catalogId: string): Promise<ID[] | null> {
    const key = `${CATEGORIES_ID_PREFIX}@${catalogId}`;
    return this.kv.get<ID[] | null>(key, []);
  }

  updateCategoriesIds(catalogId: string, ids: string[]): Promise<void> {
    const key = `${CATEGORIES_ID_PREFIX}@${catalogId}`;
    return this.kv.set(key, ids);
  }

  deleteCategoriesIds(catalogId: string): Promise<Array<ID> | null> {
    const key = `${CATEGORIES_ID_PREFIX}@${catalogId}`;
    return this.kv.delete<Array<ID>>(key);
  }

  observableCategoriesIds(catalogId: string): Observable<ID[] | null> {
    const key = `${CATEGORIES_ID_PREFIX}@${catalogId}`;
    return this.kv.observable<ID[] | null>(key);
  }
}
