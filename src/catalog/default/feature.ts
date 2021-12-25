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
import {Style} from '../../style';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import T from '../../l10n';
import reorder from '../../lib/reorder';
import {CatalogDefault} from './catalog';
import {makeEmptyRichText} from '../../richtext';

export class FeatureDefault implements Feature {
  private readonly p: FeatureProps;

  private readonly catalog: CatalogDefault;

  private readonly cache: Record<ID, FeatureDefault>;

  private makeDefs(): FeatureProps {
    return {
      id: makeId(),
      style: this.catalog.map2styles.defaultStyle,
      description: makeEmptyRichText(),
      geometry: {coordinate: {alt: 0, lat: 0, lon: 0}},
      summary: '',
      title: '',
      visible: true,
    };
  }

  constructor(catalog: CatalogDefault, props: FeatureProps | null) {
    this.catalog = catalog;
    if (props === null) {
      this.p = this.makeDefs();
    } else {
      this.p = {
        ...this.makeDefs(),
        ...props,
      };
    }
    this.cache = catalog.featuresCache;
    this.id = this.p.id;
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

  get description(): RichText {
    return this.p.description;
  }

  set description(value: RichText) {
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
      this.catalog.notifyVisisbleFeaturesChanged();
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

  delete(notify = true): Promise<void> {
    delete this.cache[this.id];
    if (notify) {
      this.catalog.notifyVisisbleFeaturesChanged();
    }
    return this.catalog.storage.deleteFeatureProps(this.p);
  }

  observable(): Observable<Feature | null> {
    return this.catalog.storage.observableFeatureProps(this.p)
      .pipe(map(value => value === null ? null : this));
  }

  update(): Promise<void> {
    return this.catalog.storage.updateFeatureProps(this.p);
  }
}

const isFeatureDefault = (propsOrFeature: FeatureProps | FeatureDefault): propsOrFeature is FeatureDefault =>
  (propsOrFeature as FeatureDefault).update !== undefined;

export class FeaturesDefault implements Features {
  readonly ts: ID = makeId();

  private readonly cacheKey: ID;

  private readonly featuresCache: Record<ID, FeatureDefault>;

  private readonly idsCache: Record<ID, ID[]>;

  private readonly catalog: CatalogDefault;

  private readonly routeId: ID;

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
    return this.idsCache[this.cacheKey];
  }

  constructor(catalog: CatalogDefault, routeId: ID) {
    this.catalog = catalog;
    this.cacheKey = routeId;
    this.idsCache = catalog.featuresIds;
    this.featuresCache = catalog.featuresCache;
    this.routeId = routeId;
  }

  private addFeature(feature: FeatureDefault, position?: number): Promise<Feature> {
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
    const p1 = feature.update();
    const p2 = this.update();
    this.catalog.notifyVisisbleFeaturesChanged();
    return Promise.all([p1, p2]).then(() => feature);
  }

  add(props: FeatureProps, position?: number): Promise<Feature> {
    if (props === null) {
      const feature = new FeatureDefault(this.catalog, null);
      return this.addFeature(feature, position);
    } else if (isFeatureDefault(props)) {
      return this.addFeature(props, position);
    }
    const p = {...props};
    if (!p.title) {
      p.title = `${isPoint(props.geometry) ? T`Point` : T`Line`} ${this.guardedIds.length + 1}`;
    }
    if (!p.id) {
      p.id = makeId();
    }
    const feature = new FeatureDefault(this.catalog, p);
    return this.addFeature(feature, position);
  }

  hasFeature (feature: Feature): boolean {
    return this.guardedIds.indexOf(feature.id) >= 0;
  }

  private update(): Promise<void> {
    return this.catalog.storage.updateFeaturesIds(this.routeId, this.guardedIds);
  }

  byPos(index: number): Feature | null {
    return this.featuresCache[this.guardedIds[index]] || null;
  }

  delete(): Promise<void> {
    const ids = this.guardedIds;
    this.updateIds([]);
    const promises = ids.map(id => this.featuresCache[id].delete(false));
    this.catalog.notifyVisisbleFeaturesChanged();
    return this.catalog.storage.deleteFeaturesIds(this.routeId)
      .then(() => Promise.all(promises)) as unknown as Promise<void>;
  }

  get length(): number {
    return this.guardedIds.length;
  }

  observable(): Observable<Features> {
    return this.catalog.storage.observableFeaturesIds(this.routeId).pipe(map((p) => p === null ? null : this));
  }

  remove(feature: Feature): Promise<number> {
    const ids = this.guardedIds;
    const pos = ids.indexOf(feature.id);
    if (pos < 0) {
      return Promise.resolve(0);
    }
    this.updateIds(ids.slice(0, pos).concat(ids.slice(pos + 1)));

    const p2 = this.update();
    const p1 = (feature as FeatureDefault).delete(false); // will notify visibility
    this.catalog.notifyVisisbleFeaturesChanged(); // NOTIFY ASAP - not necessary but just in case

    return Promise.all([p1, p2])
      .then(() => 1 /* count*/);
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
