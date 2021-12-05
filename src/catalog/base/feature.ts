import {
  Coordinate,
  Feature,
  FeatureProps,
  Features,
  ID,
  LineString,
  Point,
  isCoordinate,
  isLineString,
  isPoint,
} from '../index';
import {makeId} from '../../lib/id';
import {Map2Styles, Style} from '../../style';
import {Observable} from 'rxjs';
import {CatalogStorage} from '../storage';
import {map} from 'rxjs/operators';
import T from '../../l10n';
import reorder from '../../lib/reorder';

export class FeatureDefault implements Feature {
  private readonly p: FeatureProps;

  private readonly storage: CatalogStorage;

  private readonly map2styles: Map2Styles;

  private readonly cache: Record<ID, Feature>;

  private readonly notifyFeaturesVisibility: () => void;

  private makeDefs(): FeatureProps {
    return {
      id: makeId(),
      style: this.map2styles.defaultStyle,
      description: '',
      geometry: {coordinate: {alt: 0, lat: 0, lon: 0}},
      summary: '',
      title: '',
      visible: true,
    };
  }

  constructor(
    storage: CatalogStorage,
    map2styles: Map2Styles,
    props: FeatureProps | null,
    cache: Record<ID, Feature>, notifyFeaturesVisibility: () => void,
  ) {
    this.storage = storage;
    this.map2styles = map2styles;
    if (props === null) {
      this.p = this.makeDefs();
    } else {
      this.p = {
        ...this.makeDefs(),
        ...props,
      };
    }
    this.cache = cache;
    this.id = this.p.id;
    this.notifyFeaturesVisibility = notifyFeaturesVisibility;
  }

  get style(): Style {
    return this.p.style;
  }

  set style(value: Style) {
    this.p.style = value;
    this.update();
  }

  get geometry(): Point | LineString {
    return this.p.geometry;
  }

  set geometry(value: Point | LineString) {
    this.p.geometry = value;
    this.update();
  }

  get description(): string {
    return this.p.description;
  }

  set description(value: string) {
    this.p.description = value;
    this.update();
  }

  readonly id: ID;

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
      this.notifyFeaturesVisibility();
    }
  }

  eq(anotherFeature: Feature): boolean {
    if (anotherFeature.id === this.p.id) {
      return true;
    }
    const p = this.p;
    if (anotherFeature.style.id !== p.style.id) {
      return false;
    }
    if (anotherFeature.description !== p.description) {
      return false;
    }
    if (anotherFeature.title !== p.title) {
      return false;
    }
    if (anotherFeature.summary !== p.summary) {
      return false;
    }
    if (anotherFeature.visible !== p.visible) {
      return false;
    }
    if (isPoint(p.geometry) && isPoint(anotherFeature.geometry)) {
      const c0 = p.geometry.coordinate;
      const c1 = anotherFeature.geometry.coordinate;
      return c0.lat === c1.lat && c0.lat === c1.lat && c0.alt === c1.alt;
    } else if (isLineString(p.geometry) && isLineString(anotherFeature.geometry)) {
      const cc0 = p.geometry.coordinates;
      const cc1 = anotherFeature.geometry.coordinates;
      if (cc0.length !== cc1.length) {
        return false;
      }
      for (let i = 0; i < cc0.length; i++) {
        const c0 = cc0[i];
        const c1 = cc1[i];
        if (c0.lat !== c1.lat || c0.lat !== c1.lat || c0.alt !== c1.alt) {
          return false;
        }
      }
      return true;
    }
    return false;
  }

  updateCoordinates(coord: Coordinate | Coordinate[]): void {
    if (isCoordinate(coord)) {
      this.geometry = {coordinate: coord};
    } else {
      this.geometry = {coordinates: coord};
    }
  }

  delete(): Promise<void> {
    delete this.cache[this.id];
    return this.storage.deleteFeatureProps(this.p);
  }

  observable(): Observable<Feature | null> {
    return this.storage.observableFeatureProps(this.p)
      .pipe(map(value => value === null ? null : this));
  }

  update(): void {
    this.storage.updateFeatureProps(this.p);
  }
}

export class FeaturesDefault implements Features {
  readonly ts: ID = makeId();

  private readonly cacheKey: ID;

  private readonly featuresCache: Record<ID, Feature>;

  private readonly idsCache: Record<ID, ID[]>;

  private readonly storage: CatalogStorage;

  private readonly map2styles: Map2Styles;

  private readonly routeId: ID;

  private readonly notifyFeaturesVisibility: () => void;

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
    return this.idsCache[this.cacheKey];
  }

  constructor(
    storage: CatalogStorage,
    map2styles: Map2Styles,
    routeId: ID,
    idsCache: Record<ID, ID[]>,
    featuresCache: Record<ID, Feature>,
    notifyFeaturesVisibility: () => void,
  ) {
    this.storage = storage;
    this.map2styles = map2styles;
    this.idsCache = idsCache;
    this.cacheKey = routeId;
    this.featuresCache = featuresCache;
    this.routeId = routeId;
    this.notifyFeaturesVisibility = notifyFeaturesVisibility;
  }

  add(props: FeatureProps, position?: number): Promise<Feature> {
    const p = {...props};
    if (!p.title) {
      p.title = `${isPoint(props.geometry) ? T`Point` : T`Line`} ${this.guardedIds.length + 1}`;
    }
    if (!p.id) {
      p.id = makeId();
    }
    const feature = new FeatureDefault(this.storage, this.map2styles, p, this.featuresCache, this.notifyFeaturesVisibility);
    feature.update();
    this.featuresCache[feature.id] = feature;

    let ids = this.idsCache[this.cacheKey];
    if (!ids) {
      ids = [];
    }
    const pos = position || ids.length;
    // update caches before triggering feature observable
    // in order to have id of the new feature in the ids array
    this.updateIds(ids.slice(0, pos).concat(feature.id)
      .concat(ids.slice(pos)));
    return this.update().then(() => {
      this.notifyFeaturesVisibility();
      return feature;
    });
  }

  hasFeature (feature: Feature): boolean {
    return this.guardedIds.indexOf(feature.id) >= 0;
  }

  private update(): Promise<void> {
    return this.storage.updateFeaturesIds(this.routeId, this.guardedIds);
  }

  byPos(index: number): Feature | null {
    return this.featuresCache[this.guardedIds[index]] || null;
  }

  delete(): Promise<void> {
    const ids = this.guardedIds;
    this.updateIds([]);
    return this.storage.deleteFeaturesIds(this.routeId)
      .then(() => Promise.all(ids.map(id => this.featuresCache[id].delete()))) as unknown as Promise<void>;
  }

  get length(): number {
    return this.guardedIds.length;
  }

  observable(): Observable<Features> {
    return this.storage.observableFeaturesIds(this.routeId).pipe(map(() => this));
  }

  remove(feature: Feature): Promise<number> {
    const ids = this.guardedIds;
    const pos = ids.indexOf(feature.id);
    if (pos < 0) {
      return Promise.resolve(0);
    }
    this.updateIds(ids.slice(0, pos).concat(ids.slice(pos + 1)));

    return Promise.all([
      feature.delete(),
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

  [Symbol.iterator](): Iterator<Feature> {
    const _ids = this.guardedIds.slice(); // don't reflect modifications after the iterator has been created
    let _current = 0;
    return {
      next: () => _current >= _ids.length
        ? {done: true, value: null}
        : {done: false, value: this.byPos(_current++)},
    };
  }

}
