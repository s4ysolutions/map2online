import {Categories, Category, CategoryProps, Feature, ID, Route, RouteProps, Routes} from '../index';
import {CatalogStorage} from '../storage';
import {makeId} from '../../lib/id';
import {RoutesDefault} from './route';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

export class CategoryDefault implements Category {

  private readonly p: CategoryProps;

  private readonly storage: CatalogStorage;

  private readonly notifyFeaturesVisibility: () => void;

  constructor(
    storage: CatalogStorage,
    props: RouteProps | null,
    featuresIdsCache: Record<ID, ID[]>,
    featuresCache: Record<ID, Feature>,
    routesIdsCache: Record<ID, ID[]>,
    routesCache: Record<ID, Route>,
    notifyFeaturesVisibility: () => void,
  ) {
    this.storage = storage;
    this.p = props;
    this.id = this.p.id;
    this.notifyFeaturesVisibility = notifyFeaturesVisibility;
    this.routes = new RoutesDefault(storage, this.id, routesIdsCache, routesCache, featuresIdsCache, featuresCache, notifyFeaturesVisibility);
  }

  readonly id: ID;

  readonly ts = makeId();

  get description() {
    return this.p.description;
  }

  set description(value) {
    this.p.description = value;
    this.update();
  }

  readonly routes: Routes;

  get summary() {
    return this.p.summary;
  }

  set summary(value) {
    this.p.summary = value;
    this.update();
  }

  get title() {
    return this.p.title;
  }

  set title(value) {
    this.p.title = value;
    this.update();
  }

  get visible() {
    return this.p.visible;
  }

  set visible(value) {
    const notify = value !== this.p.visible;
    this.p.visible = value;
    this.update();
    if (notify) {
      this.notifyFeaturesVisibility();
    }
  }

  get open() {
    return this.p.open;
  }

  set open(value) {
    this.p.open = value;
    this.update();
  }

  update(): void {
    this.storage.updateCategoryProps(this.p);
  }

  delete(): Promise<void> {
    return Promise.all([
      this.routes.delete(),
      this.storage.deleteCategoryProps(this.p),
    ]) as unknown as Promise<void>;
  }

  observable(): Observable<Category> {
    return this.storage.observableCategoryProps(this.p)
      .pipe(map(value => value === null ? null : this));
  }
}

export class CategoriesDefault implements Categories {

  private readonly cacheKey: ID;

  private readonly catalogId: ID;

  private readonly routesIdsCache: Record<ID, ID[]>;

  private readonly routesCache: Record<ID, Route>;

  private readonly idsCache: Record<ID, ID[]>;

  private readonly categoriesCache: Record<ID, Category>;

  private readonly featuresIdsCache: Record<ID, ID[]>;

  private readonly featuresCache: Record<ID, Feature>;

  private readonly storage: CatalogStorage;

  private readonly notifyFeaturesVisibility: () => void;

  private updateIds = (ids: ID[]) => {
    if (ids !== this.idsCache[this.cacheKey]) {
      this.idsCache[this.cacheKey] = ids;
    }
  };

  constructor(
    storage: CatalogStorage,
    catalogId: ID,
    routesIdsCache: Record<ID, ID[]>,
    routesCache: Record<ID, Route>,
    catrgoriesIdsCache: Record<ID, ID[]>,
    categoriesCache: Record<ID, Category>,
    featuresIdsCache: Record<ID, ID[]>,
    featuresCache: Record<ID, Feature>,
    notifyFeaturesVisibility: () => void,
  ) {
    this.storage = storage;
    this.idsCache = routesIdsCache;
    this.cacheKey = catalogId;
    this.routesCache = routesCache;
    this.routesIdsCache = routesIdsCache;
    this.featuresCache = featuresCache;
    this.featuresIdsCache = featuresIdsCache;
    this.categoriesCache = categoriesCache;
    this.idsCache = catrgoriesIdsCache;
    this.catalogId = catalogId;
    this.notifyFeaturesVisibility = notifyFeaturesVisibility;
  }

  add(props: CategoryProps, position: number | undefined): Promise<Category> {
    const p = {...props};
    if (!p.id) {
      p.id = makeId();
    }
    const category = new CategoryDefault(
      this.storage,
      p,
      this.featuresIdsCache,
      this.featuresCache,
      this.routesIdsCache,
      this.routesCache,
      this.notifyFeaturesVisibility,
    );
    category.update();
    this.categoriesCache[category.id] = category;

    const ids = this.idsCache[this.cacheKey];
    const pos = position || ids.length;
    // update caches before triggering feature observable
    // in order to have id of the new feature in the ids array
    this.updateIds(ids.slice(0, pos).concat(category.id)
      .concat(ids.slice(pos)));
    return this.update().then(() => {
      this.notifyFeaturesVisibility();
      return category;
    });
  }

  private update(): Promise<void> {
    return this.storage.updateCategoriesIds(this.catalogId, this.idsCache[this.cacheKey]);
  }

  byPos(index: number): Category | null {
    return this.categoriesCache[this.idsCache[this.cacheKey][index]] || null;
  }

  delete(): Promise<void> {
    return this.storage.deleteRoutesIds(this.catalogId)
      .then(() => Promise.all(this.idsCache[this.cacheKey].map(id => this.categoriesCache[id].delete()))) as unknown as Promise<void>;
  }

  get length(): number {
    return this.idsCache[this.cacheKey].length;
  }

  observable(): Observable<Categories> {
    return this.storage.observableCategoriesIds(this.catalogId).pipe(map(() => this));
  }

  remove(route: Route): Promise<number> {
    const ids = this.idsCache[this.cacheKey];
    const pos = ids.indexOf(route.id);
    if (pos < 0) {
      return Promise.resolve(0);
    }
    this.updateIds(ids.slice(0, pos).concat(ids.slice(pos + 1)));

    return Promise.all([
        route.delete(),
        this.update(),
      ])
      .then(() => {
        this.notifyFeaturesVisibility();
        return 1; // count
      });
  }

  reorder(from: number, to: number): Promise<void> {
    const ids = this.idsCache[this.cacheKey];
    this.updateIds(reorder(ids, from, to));
    return this.update();
  }

  [Symbol.iterator](): Iterator<Route> {
    const ids = this.idsCache[this.cacheKey];
    const _ids = ids.slice(); // don't reflect modifications after the iterator has been created
    let _current = 0;
    return {
      next: () => _current >= _ids.length
        ? {done: true, value: null}
        : {done: false, value: this.byPos(_current++)},
    };
  }

}