import {Catalog, Categories, Category, Feature, ID, Route} from '../index';
import {CatalogStorage} from '../storage';
import {FeatureDefault} from './feature';
import {Observable, Subject} from 'rxjs';
import {RouteDefault} from './route';
import {CategoriesDefault, CategoryDefault} from './category';
import {debounceTime} from 'rxjs/operators';
import {Wording} from '../../personalization/wording';
import {Map2Styles} from '../../style';
import log from '../../log';

const DEBOUNCE_DELAY = 250;

export class CatalogDefault implements Catalog {
  static getInstanceAsync(storage: CatalogStorage, wording: Wording, map2styles: Map2Styles, catalogId: string): Promise<Catalog> {

    const instance = new CatalogDefault(
      storage,
      wording,
      map2styles,
      catalogId,
    );

    return instance.init();
  }

  readonly id: ID;

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
  ) {
    this.id = catalogId;
    this.storage = storage;
    this.wording = wording;
    this.map2styles = map2styles;
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

  async init(): Promise<CatalogDefault> {
    const autoCreate = this.disableAutoCreateCategoryAndRoute();

    await this.storage.readCategoriesIds(this.id).then(ids => {
      this.categoriesIds[this.id] = ids;
    });
    const categoriesIdsFlat = Object.values(this.categoriesIds).flat();
    log.debug('CatalogDefault init, categoriesIds', categoriesIdsFlat);

    await Promise.all(categoriesIdsFlat.map(categoryId => this.storage.readRoutesIds(categoryId).then(ids => {
      this.routesIds[categoryId] = ids;
    })));
    const routesIdsFlat: ID[] = Object.values(this.routesIds).flat();

    await Promise.all(routesIdsFlat.map(routeId => this.storage.readFeaturesIds(routeId).then(ids => {
      this.featuresIds[routeId] = ids;
    })));
    const featuresIdsFlat: ID[] = Object.values(this.routesIds).flat();

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    await Promise.all(featuresIdsFlat.map(id => this.storage.readFeatureProps(id)
      .then(props => {
        if (props !== null) {
          const feature = new FeatureDefault(this, props);
          this.featuresCache[feature.id] = feature;
        }
      })));
    await Promise.all(routesIdsFlat.map(id => this.storage.readRouteProps(id)
      .then(props => {
        if (props !== null) {
          const route = new RouteDefault(this, props);
          this.routesCache[route.id] = route;
        }
      })));
    await Promise.all(categoriesIdsFlat.map(id => this.storage.readCategoryProps(id)
      .then(props => {
        if (props !== null) {
          const category = new CategoryDefault(this, props);
          this.categoriesCache[category.id] = category;
        }
      })));
    if (autoCreate) {
      this.enableAutoCreateCategoryAndRoute();
    }
    return this;
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
