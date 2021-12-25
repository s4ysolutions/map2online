import {Features, ID, Route, RouteProps, Routes} from '../index';
import {Observable} from 'rxjs';
import {makeId} from '../../lib/id';
import {FeatureDefault, FeaturesDefault} from './feature';
import {map} from 'rxjs/operators';
import reorder from '../../lib/reorder';
import {CatalogDefault} from './catalog';
import {makeEmptyRichText} from '../../richtext';

export class RouteDefault implements Route {
  private readonly p: RouteProps;

  private readonly catalog: CatalogDefault;

  private readonly cache: Record<ID, Route>;

  private makeDefs(): RouteProps {
    return {
      id: makeId(),
      description: makeEmptyRichText(),
      summary: '',
      title: this.catalog.wording.R('New route'),
      visible: true,
      open: true,
    };
  }

  constructor(catalog: CatalogDefault, props: RouteProps | null) {
    this.catalog = catalog;
    if (props === null) {
      this.p = this.makeDefs();
    } else {
      this.p = {...this.makeDefs(), ...props};
    }
    this.cache = catalog.routesCache;
    this.id = this.p.id;
    this.features = new FeaturesDefault(catalog, this.id);
  }

  readonly id: ID;

  readonly ts = makeId();

  get description(): RichText {
    return this.p.description;
  }

  set description(value: RichText) {
    this.p.description = value;
    this.update();
  }

  readonly features: Features;

  get summary(): string {
    return this.p.summary;
  }

  set summary(value: string) {
    this.p.summary = value;
    this.update();
  }

  get title(): string {
    return this.p.title;
  }

  set title(value: string) {
    this.p.title = value;
    this.update();
  }

  get visible(): boolean {
    return this.p.visible;
  }

  set visible(value: boolean) {
    const notify = value !== this.p.visible;
    this.p.visible = value;
    this.update();
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

  delete(notify = true): Promise<void> {
    delete this.cache[this.id];
    const p1 = this.features.delete();
    const p2 = this.catalog.storage.deleteRouteProps(this.p);
    if (notify) {
      this.catalog.notifyVisisbleFeaturesChanged();
    }
    return Promise.all([p1, p2]) as unknown as Promise<void>;
  }

  observable(): Observable<Route> {
    return this.catalog.storage.observableRouter(this.p)
      .pipe(map(value => value === null ? null : this));
  }

  update(): Promise<void> {
    return this.catalog.storage.updateRouteProps(this.p);
  }

}

const isRouteDefault = (propsOrRoute: RouteProps | RouteDefault): propsOrRoute is RouteDefault =>
  (propsOrRoute as RouteDefault).update !== undefined;

export class RoutesDefault implements Routes {
  readonly ts: ID = makeId();

  private readonly cacheKey: ID;

  private readonly categoryId: ID;

  private readonly routesCache: Record<ID, RouteDefault>;

  private readonly idsCache: Record<ID, ID[]>;

  private readonly featuresIdsCache: Record<ID, ID[]>;

  private readonly featuresCache: Record<ID, FeatureDefault>;

  private readonly catalog: CatalogDefault;

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
      const route = new RouteDefault(this.catalog, null);
      this.addRoute(route); //  ignore async storage backend, use sync cache
    }
    return this.idsCache[this.cacheKey];
  }

  constructor(catalog: CatalogDefault, categoryId: ID) {
    this.catalog = catalog;
    this.cacheKey = categoryId;
    this.categoryId = categoryId;
    this.idsCache = catalog.routesIds;
    this.routesCache = catalog.routesCache;
    this.featuresCache = catalog.featuresCache;
    this.featuresIdsCache = catalog.featuresIds;
  }

  private addRoute(route: RouteDefault, position?: number): Promise<Route> {
    this.routesCache[route.id] = route;

    let ids = this.idsCache[this.cacheKey];
    if (!ids) {
      ids = [];
    }
    const pos = position || ids.length;
    // update caches before triggering feature observable
    // in order to have id of the new feature in the ids array
    this.updateIds(ids.slice(0, pos).concat(route.id)
      .concat(ids.slice(pos)));
    const p1 = route.update();
    const p2 = this.update();
    this.catalog.notifyVisisbleFeaturesChanged();
    return Promise.all([p1, p2]).then(() => route);
  }

  add(props: RouteProps, position?: number): Promise<Route> {
    if (props === null) {
      const route = new RouteDefault(this.catalog, null);
      return this.addRoute(route, position);
    } else if (isRouteDefault(props)) {
      return this.addRoute(props, position);
    }
    const p = {...props};
    if (!p.id) {
      p.id = makeId();
    }
    const route = new RouteDefault(this.catalog, p);
    return this.addRoute(route, position);

  }

  private update(): Promise<void> {
    return this.catalog.storage.updateRoutesIds(this.categoryId, this.guardedIds);
  }

  byPos(index: number): Route | null {
    return this.routesCache[this.guardedIds[index]] || null;
  }

  delete(): Promise<void> {
    const ids = this.guardedIds;
    this.updateIds([]);
    const promises = ids.map(id => this.routesCache[id].delete(false));
    this.catalog.notifyVisisbleFeaturesChanged();
    return this.catalog.storage.deleteRoutesIds(this.categoryId)
      .then(() => Promise.all(promises)) as unknown as Promise<void>;
  }

  has(route: Route): boolean {
    return this.guardedIds.indexOf(route.id) >= 0;
  }

  get length(): number {
    return this.guardedIds.length;
  }

  observable(): Observable<Routes> {
    return this.catalog.storage.observableRoutesIds(this.categoryId).pipe(map(() => this));
  }

  remove(route: Route): Promise<number> {
    const ids = this.guardedIds;
    const pos = ids.indexOf(route.id);
    if (pos < 0) {
      return Promise.resolve(0);
    }
    this.updateIds(ids.slice(0, pos).concat(ids.slice(pos + 1)));

    const p1 = this.update();
    const p2 = (route as RouteDefault).delete(false);
    this.catalog.notifyVisisbleFeaturesChanged();
    return Promise.all([p1, p2]).then(() => 1 /* count*/);
  }

  reorder(from: number, to: number): Promise<void> {
    const ids = this.guardedIds;
    this.updateIds(reorder(ids, from, to));
    return this.update();
  }

  [Symbol.iterator](): Iterator<Route> {
    const _ids = this.guardedIds.slice(); // don't reflect modifications after the iterator has been created
    let _current = 0;
    return {
      next: () => _current >= _ids.length
        ? {done: true, value: null}
        : {done: false, value: this.byPos(_current++)},
    };
  }

}
