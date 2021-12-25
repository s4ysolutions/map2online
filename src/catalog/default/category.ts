import {Categories, Category, CategoryProps, ID, Routes} from '../index';
import {makeId} from '../../lib/id';
import {RouteDefault, RoutesDefault} from './route';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import reorder from '../../lib/reorder';
import {CatalogDefault} from './catalog';
import {FeatureDefault} from './feature';
import {makeEmptyRichText} from '../../richtext';

export class CategoryDefault implements Category {

  private readonly p: CategoryProps;

  private readonly catalog: CatalogDefault;

  private readonly cache: Record<ID, Category>;

  private makeDefs(): CategoryProps {
    return {
      id: makeId(),
      description: makeEmptyRichText(),
      summary: '',
      title: this.catalog.wording.C('New category'),
      visible: true,
      open: false,
    };
  }

  constructor(
    catalog: CatalogDefault,
    props: CategoryProps | null,
  ) {
    this.catalog = catalog;
    if (props === null) {
      this.p = this.makeDefs();
    } else {
      this.p = {...this.makeDefs(), ...props};
    }
    this.cache = catalog.categoriesCache;
    this.id = this.p.id;
    this.routes = new RoutesDefault(catalog, this.id);
  }

  readonly id: ID;

  readonly ts = makeId();

  get description(): RichText {
    return this.p.description;
  }

  set description(value: RichText) {
    this.p.description = value;
    this.update().then();
  }

  readonly routes: Routes;

  get summary(): string {
    return this.p.summary;
  }

  set summary(value: string) {
    this.p.summary = value;
    this.update().then();
  }

  get title(): string {
    return this.p.title;
  }

  set title(value: string) {
    this.p.title = value;
    this.update().then();
  }

  get visible(): boolean {
    return this.p.visible;
  }

  set visible(value: boolean) {
    const notify = value !== this.p.visible;
    this.p.visible = value;
    this.update().then();
    if (notify) {
      this.catalog.notifyVisisbleFeaturesChanged();
    }
  }

  get open(): boolean {
    return this.p.open;
  }

  set open(value: boolean) {
    this.p.open = value;
    this.update().then();
  }

  update(): Promise<void> {
    return this.catalog.storage.updateCategoryProps(this.p);
  }

  delete(notify = true): Promise<void> {
    delete this.cache[this.id];
    const p1 = this.routes.delete();
    const p2 = this.catalog.storage.deleteCategoryProps(this.p);
    if (notify) {
      this.catalog.notifyVisisbleFeaturesChanged();
    }
    return Promise.all([p1, p2]) as unknown as Promise<void>;
  }

  observable(): Observable<Category> {
    return this.catalog.storage.observableCategoryProps(this.p)
      .pipe(map(value => value === null ? null : this));
  }
}

const isCategoryDefault = (propsOrCategory: CategoryProps | CategoryDefault): propsOrCategory is CategoryDefault =>
  (propsOrCategory as CategoryDefault).update !== undefined;

export class CategoriesDefault implements Categories {

  private readonly catalog: CatalogDefault;

  private readonly cacheKey: ID;

  private readonly catalogId: ID;

  private readonly routesIdsCache: Record<ID, ID[]>;

  private readonly routesCache: Record<ID, RouteDefault>;

  private readonly idsCache: Record<ID, ID[]>;

  private readonly categoriesCache: Record<ID, CategoryDefault>;

  private readonly featuresIdsCache: Record<ID, ID[]>;

  private readonly featuresCache: Record<ID, FeatureDefault>;


  private updateIds(ids: ID[]) {
    if (ids !== this.idsCache[this.cacheKey]) {
      this.idsCache[this.cacheKey] = ids;
    }
  }

  private get guardedIds() {
    const ids = this.idsCache[this.cacheKey];
    if (!ids) {
      this.idsCache[this.cacheKey] = [];
    }
    if ((!ids || ids.length === 0) && this.catalog.wording.isPersonalized && this.catalog.autoCreate) {
      const category = new CategoryDefault(this.catalog, null);
      this.addCategory(category).then(); //  ignore async storage backend, use sync cache
    }
    return this.idsCache[this.cacheKey];
  }

  constructor(catalog: CatalogDefault, catalogId: ID) {
    this.catalog = catalog;
    this.catalogId = catalogId;
    this.cacheKey = catalogId;
    this.idsCache = catalog.routesIds;
    this.routesCache = catalog.routesCache;
    this.routesIdsCache = catalog.routesIds;
    this.featuresCache = catalog.featuresCache;
    this.featuresIdsCache = catalog.featuresIds;
    this.categoriesCache = catalog.categoriesCache;
    this.idsCache = catalog.categoriesIds;
  }

  private addCategory(category: CategoryDefault, position?: number): Promise<Category> {
    this.categoriesCache[category.id] = category;

    let ids = this.idsCache[this.cacheKey];
    if (!ids) {
      ids = [];
    }
    const pos = position || ids.length;
    // update caches before triggering feature observable
    // in order to have id of the new feature in the ids array
    this.updateIds(ids.slice(0, pos).concat(category.id)
      .concat(ids.slice(pos)));
    const p1 = category.update();
    const p2 = this.update();
    this.catalog.notifyVisisbleFeaturesChanged();
    return Promise.all([p1, p2]).then(() => category);
  }

  add(props: CategoryProps | null, position?: number): Promise<Category> {
    if (props === null) {
      const category = new CategoryDefault(this.catalog, null);
      return this.addCategory(category, position);
    } else if (isCategoryDefault(props)) {
      return this.addCategory(props, position);
    }
    const p = {...props};
    if (!p.id) {
      p.id = makeId();
    }
    const category = new CategoryDefault(this.catalog, p);
    return this.addCategory(category, position);

  }

  has(category: Category): boolean {
    return this.guardedIds.indexOf(category.id) >= 0;
  }

  private update(): Promise<void> {
    return this.catalog.storage.updateCategoriesIds(this.catalogId, this.guardedIds);
  }

  byPos(index: number): Category | null {
    return this.categoriesCache[this.guardedIds[index]] || null;
  }

  delete(): Promise<void> {
    const ids = this.guardedIds;
    this.updateIds([]);
    const promises = ids.map(id => this.categoriesCache[id].delete(false));
    this.catalog.notifyVisisbleFeaturesChanged();
    return this.catalog.storage.deleteRoutesIds(this.catalogId)
      .then(() => Promise.all(promises)) as unknown as Promise<void>;
  }

  get length(): number {
    return this.guardedIds.length;
  }

  observable(): Observable<Categories> {
    return this.catalog.storage.observableCategoriesIds(this.catalogId).pipe(map((p) => p === null ? null : this));
  }

  remove(category: Category): Promise<number> {
    const ids = this.guardedIds;
    const pos = ids.indexOf(category.id);
    if (pos < 0) {
      return Promise.resolve(0);
    }
    this.updateIds(ids.slice(0, pos).concat(ids.slice(pos + 1)));

    const p2 = this.update();
    const p1 = (category as CategoryDefault).delete(false);
    this.catalog.notifyVisisbleFeaturesChanged();
    return Promise.all([p1, p2])
      .then(() => 1 /* count*/);
  }

  reorder(from: number, to: number): Promise<void> {
    const ids = this.guardedIds;
    this.updateIds(reorder(ids, from, to));
    return this.update();
  }

  [Symbol.iterator](): Iterator<Category> {
    const _ids = this.guardedIds.slice(); // don't reflect modifications after the iterator has been created
    let _current = 0;
    return {
      next: () => _current >= _ids.length
        ? {done: true, value: null}
        : {done: false, value: this.byPos(_current++)},
    };
  }
}
