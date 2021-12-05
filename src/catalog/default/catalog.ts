import {Catalog, Categories, Category, Feature, ID, Route} from '../index';
import {CatalogStorage} from '../storage';
import {FeatureDefault} from './feature';
import {Observable, Subject} from 'rxjs';
import {RouteDefault} from './route';
import {CategoriesDefault, CategoryDefault} from './category';
import {debounceTime} from 'rxjs/operators';
import {Wording} from '../../personalization/wording';
import {Map2Styles} from '../../style';

const DEBOUNCE_DELAY = 250;

export class CatalogDefault implements Catalog {
  static async getInstanceAsync(storage: CatalogStorage, wording: Wording, map2styles: Map2Styles, catalogId: string): Promise<Catalog> {
    const categoriesIds: Record<ID, ID[]> = {};
    await storage.readCategoriesIds(catalogId).then(ids => {
      categoriesIds[catalogId] = ids;
    });
    const categoriesIdsFlat = Object.values(categoriesIds).flat();

    const routesIds: Record<ID, ID[]> = {};
    await Promise.all(categoriesIdsFlat.map(categoryId => storage.readRoutesIds(categoryId).then(ids => {
      routesIds[categoryId] = ids;
    })));
    const routesIdsFlat: ID[] = Object.values(routesIds).flat();

    const featuresIds: Record<ID, ID[]> = {};
    await Promise.all(routesIdsFlat.map(routeId => storage.readFeaturesIds(routeId).then(ids => {
      featuresIds[routeId] = ids;
    })));
    const featuresIdsFlat: ID[] = Object.values(routesIds).flat();

    const categoriesCache: Record<ID, Category> = {};
    const routesCache: Record<ID, Route> = {};
    const featuresCache: Record<ID, Feature> = {};

    const instance = new CatalogDefault(
      storage,
      wording,
      map2styles,
      catalogId,
      featuresIds,
      featuresCache,
      routesIds,
      routesCache,
      categoriesIds,
      categoriesCache,
    );

    instance.disableAutoCreateCategoryAndRoute();
    await Promise.all(featuresIdsFlat.map(id => storage.readFeatureProps(id)
      .then(props => {
        if (props !== null) {
          const feature = new FeatureDefault(instance, props);
          featuresCache[feature.id] = feature;
        }
      })));
    await Promise.all(routesIdsFlat.map(id => storage.readRouteProps(id)
      .then(props => {
        if (props !== null) {
          const route = new RouteDefault(instance, props);
          routesCache[route.id] = route;
        }
      })));
    await Promise.all(categoriesIdsFlat.map(id => storage.readCategoryProps(id)
      .then(props => {
        if (props !== null) {
          const category = new CategoryDefault(instance, props);
          categoriesCache[category.id] = category;
        }
      })));
    instance.enableAutoCreateCategoryAndRoute();

    return instance;
  }

  readonly storage: CatalogStorage;

  readonly categoriesCache: Record<ID, Category> = {};

  readonly routesCache: Record<ID, Route> = {};

  readonly featuresCache: Record<ID, Feature> = {};

  readonly categoriesIds: Record<ID, ID[]> = {};

  readonly routesIds: Record<ID, ID[]> = {};

  readonly featuresIds: Record<ID, ID[]> = {};

  readonly wording: Wording;

  readonly map2styles: Map2Styles;

  readonly subjectVisibleFeatures = new Subject<Feature[]>();

  readonly observableVisisbleFeaturesDebounced = this.subjectVisibleFeatures.pipe(debounceTime(DEBOUNCE_DELAY));

  notifyVisisbleFeaturesChanged: () => void;

  constructor(
    storage: CatalogStorage,
    wording: Wording,
    map2styles: Map2Styles,
    catalogId: ID,
    featuresIds: Record<ID, ID[]>,
    featuresCache: Record<ID, Feature>,
    routesIds: Record<ID, ID[]>,
    routesCache: Record<ID, Route>,
    categoriesIds: Record<ID, ID[]>,
    categoriesCache: Record<ID, Category>,
  ) {
    this.storage = storage;
    this.wording = wording;
    this.map2styles = map2styles;
    this.categoriesCache = categoriesCache;
    this.routesCache = routesCache;
    this.featuresCache = featuresCache;
    this.categoriesIds = categoriesIds;
    this.routesIds = routesIds;
    this.featuresIds = featuresIds;
    this.notifyVisisbleFeaturesChanged = () => {
      const prevVisibleIds = this.visibleIds;
      const prevLength = this.visibleFeatures.length;
      this.visibleFeatures = [];
      this.visibleIds = new Set();
      let needNotify = false;
      for (const category of this.categories) {
        if (category.visible) {
          for (const route of category.routes) {
            if (route.visible) {
              for (const feature of route.features) {
                if (feature.visible) {
                  this.visibleFeatures.push(feature);
                  this.visibleIds.add(feature.id);
                  if (!prevVisibleIds.has(feature.id)) {
                    needNotify = true;
                  }
                }
              }
            }
          }
        }
      }
      if (needNotify || this.visibleFeatures.length !== prevLength) {
        this.subjectVisibleFeatures.next(this.visibleFeatures);
      }
    };
    this.categories = new CategoriesDefault(this, catalogId);
  }

  readonly categories: Categories;

  categoryById(id: ID): Category | null {
    return this.categoriesCache[id];
  }

  featureById(id: ID): Feature | null {
    return this.featuresCache[id];
  }

  routeById(id: ID): Route | null {
    return this.routesCache[id];
  }

  visibleIds: Set<ID> = new Set();

  visibleFeatures: Feature[] = [];

  visibleFeaturesObservable(debounce?: boolean): Observable<Feature[]> {
    return debounce ? this.observableVisisbleFeaturesDebounced : this.subjectVisibleFeatures;
  }

  autoCreate = true;

  disableAutoCreateCategoryAndRoute() {
    const ret = this.autoCreate;
    this.autoCreate = false;
    return ret;
  }

  enableAutoCreateCategoryAndRoute() {
    const ret = this.autoCreate;
    this.autoCreate = true;
    return ret;
  }
}
