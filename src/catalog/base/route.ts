import {Feature, FeatureProps, Features, ID, Route, RouteProps, Routes} from '../index';
import {Observable} from 'rxjs';
import {CatalogStorage} from '../storage';
import {makeId} from '../../lib/id';
import {FeaturesDefault} from './feature';
import {map} from 'rxjs/operators';
import reorder from '../../lib/reorder';
import {Wording} from '../../personalization/wording';
import {Map2Styles} from '../../style';

export class RouteDefault implements Route {
  private readonly p: RouteProps;

  private readonly storage: CatalogStorage;

  private readonly wording: Wording;

  private readonly map2styles: Map2Styles;

  private readonly notifyFeaturesVisibility: () => void;

  private readonly cache: Record<ID, Route>;

  private makeDefs(): RouteProps {
    return {
      id: makeId(),
      description: '',
      summary: '',
      title: this.wording.R('New route'),
      visible: true,
      open: true,
    };
  }

  constructor(
    storage: CatalogStorage,
    wording: Wording,
    map2styles: Map2Styles,
    props: RouteProps | null,
    cache: Record<ID, Route>,
    featuresIdsCache: Record<ID, ID[]>,
    featuresCache: Record<ID, Feature>,
    notifyFeaturesVisibility: () => void,
  ) {
    this.storage = storage;
    this.wording = wording;
    this.map2styles = map2styles;
    if (props === null) {
      this.p = this.makeDefs();
    } else {
      this.p = {...this.makeDefs(), ...props};
    }
    this.cache = cache;
    this.id = this.p.id;
    this.notifyFeaturesVisibility = notifyFeaturesVisibility;
    this.features = new FeaturesDefault(storage, map2styles, this.id, featuresIdsCache, featuresCache, notifyFeaturesVisibility);
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

  readonly features: Features;

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

  delete(): Promise<void> {
    delete this.cache[this.id];
    return Promise.all([
      this.features.delete(),
      this.storage.deleteRouteProps(this.p),
    ]) as unknown as Promise<void>;
  }

  observable(): Observable<Route> {
    return this.storage.observableRouter(this.p)
      .pipe(map(value => value === null ? null : this));
  }

  update(): void {
    this.storage.updateRouteProps(this.p);
  }

}

export class RoutesDefault implements Routes {
  readonly ts: ID = makeId();

  private readonly cacheKey: ID;

  private readonly categoryId: ID;

  private readonly routesCache: Record<ID, Route>;

  private readonly idsCache: Record<ID, ID[]>;

  private readonly featuresIdsCache: Record<ID, ID[]>;

  private readonly featuresCache: Record<ID, Feature>;

  private readonly storage: CatalogStorage;

  private readonly map2styles: Map2Styles;

  private readonly notifyFeaturesVisibility: () => void;

  private readonly wording: Wording;

  private updateIds = (ids: ID[]) => {
    if (ids !== this.idsCache[this.cacheKey]) {
      this.idsCache[this.cacheKey] = ids;
    }
  };

  private get guardedIds() {
    const ids = this.idsCache[this.cacheKey];
    if (!ids) {
      this.idsCache[this.cacheKey] = [];
    }
    if ((!ids || ids.length === 0) && this.wording.isPersonalized) {
      const route = new RouteDefault(
        this.storage,
        this.wording,
        this.map2styles,
        null,
        this.routesCache,
        this.featuresIdsCache,
        this.featuresCache,
        this.notifyFeaturesVisibility,
      );
      this.add(route); //  ignore async storage backend, use sync cache
    }
    return this.idsCache[this.cacheKey];
  }

  constructor(
    storage: CatalogStorage,
    wording: Wording,
    map2styles: Map2Styles,
    categoryId: ID,
    routesIdsCache: Record<ID, ID[]>,
    routesCache: Record<ID, Route>,
    featuresIdsCache: Record<ID, ID[]>,
    featuresCache: Record<ID, Feature>,
    notifyFeaturesVisibility: () => void,
  ) {
    this.storage = storage;
    this.wording = wording;
    this.map2styles = map2styles;
    this.idsCache = routesIdsCache;
    this.cacheKey = categoryId;
    this.routesCache = routesCache;
    this.featuresCache = featuresCache;
    this.featuresIdsCache = featuresIdsCache;
    this.categoryId = categoryId;
    this.notifyFeaturesVisibility = notifyFeaturesVisibility;
  }

  add(props: RouteProps, position?: number): Promise<Route> {
    const p = {...props};
    if (!p.id) {
      p.id = makeId();
    }
    const route = new RouteDefault(
      this.storage,
      this.wording,
      this.map2styles,
      p,
      this.routesCache,
      this.featuresIdsCache,
      this.featuresCache,
      this.notifyFeaturesVisibility,
    );
    route.update();
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
    return this.update().then(() => {
      this.notifyFeaturesVisibility();
      return route;
    });
  }

  private update(): Promise<void> {
    return this.storage.updateRoutesIds(this.categoryId, this.guardedIds);
  }

  byPos(index: number): Route | null {
    return this.routesCache[this.guardedIds[index]] || null;
  }

  delete(): Promise<void> {
    const ids = this.guardedIds;
    this.updateIds([]);
    return this.storage.deleteRoutesIds(this.categoryId)
      .then(() => Promise.all(ids.map(id => this.routesCache[id].delete()))) as unknown as Promise<void>;
  }

  hasRoute(route: Route): boolean {
    return this.guardedIds.indexOf(route.id) >= 0;
  }

  get length(): number {
    return this.guardedIds.length;
  }

  observable(): Observable<Routes> {
    return this.storage.observableRoutesIds(this.categoryId).pipe(map(() => this));
  }

  remove(route: Route): Promise<number> {
    const ids = this.guardedIds;
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
