import {Catalog, Feature, FeatureProps, Features, ID, isCoordinate, isPoint, LineString, Point, Route} from '../index';
import {KV} from '../../../kv-rx';
import {makeId} from '../../../l10n/id';
import {map} from 'rxjs/operators';
import reorder from '../../../lib/reorder';
import {Color} from '../../../lib/colors';
import T from '../../../l10n';

export const FEATURE_ID_PREFIX = "f";
export const FEATURES_ID_PREFIX = "fs";

const newFeatureProps = (): FeatureProps => ({
  id: makeId(),
  color: Color.RED,
  description: '',
  geometry: {coordinate: {alt: 0, lat: 0, lon: 0}},
  summary: '',
  title: '',
  visible: true,
});

interface Updatebale {
  update: () => void;
}

export const featureFactory = (storage: KV, catalog: Catalog, props: FeatureProps | null): Feature & Updatebale | null => {
  const p: FeatureProps = props === null ? newFeatureProps() : {...props};
  const key = `${FEATURE_ID_PREFIX}@${p.id}`;
  return {
    get color() {
      return p.color;
    },
    set color(value) {
      p.color = value;
      this.update();
    },
    get geometry() {
      return p.geometry;
    },
    set geometry(value) {
      p.geometry = value;
      this.update();
    },
    get description() {
      return p.description
    },
    set description(value) {
      p.description = value;
      this.update();
    },
    id: p.id || makeId(),
    get summary() {
      return p.summary
    },
    set summary(value) {
      p.summary = value;
      this.update();
    },
    get title() {
      return p.title
    },
    set title(value) {
      p.title = value;
      this.update();
    },
    get visible() {
      return p.visible
    },
    set visible(value) {
      p.visible = value;
      this.update();
    },
    updateCoordinates: function (coord) {
      if (isCoordinate(coord)) {
        // noinspection UnnecessaryLocalVariableJS
        const point: Point = {coordinate: coord};
        this.geometry = point;
      } else {
        // noinspection UnnecessaryLocalVariableJS
        const lineString: LineString = {coordinates: coord};
        this.geometry = lineString;
      }
    },
    observable: () => storage.observable<FeatureProps | null>(key)
      .pipe(
        map(props => props === null ? null : catalog.featureById(props.id))
      ),
    delete: () => {
      storage.delete(key);
      storage.delete(`vis@${p.id}`); // visibility
      storage.delete(`op@${p.id}`); // visibility
    },
    update: () => {
      storage.set(key, p);
    },
  };
};

const iids: Record<ID, ID[]> = {}

export const featuresFactory = (storage: KV, catalog: Catalog, route: Route): Features => {
  const key = `${FEATURES_ID_PREFIX}@${route.id}`;
  iids[key] = storage.get<ID[]>(key, []);
  const updateIds = (ids: ID[]) => {
    if (ids !== iids[key]) {
      iids[key] = ids.slice();
      storage.set(key, ids);
    }
  };
  return {
    add: function (props: FeatureProps, position: number) {
      const p = {...props}
      if (!p.title) {
        p.title = (isPoint(props.geometry) ? T`Point` : T`Line`) + ` ${iids[key].length + 1}`
      }
      if (!p.id) {
        p.id = makeId()
      }
      const feature = featureFactory(storage, catalog, p);
      feature.update();
      const ids0 = iids[key]
      const pos = position || ids0.length;
      updateIds(ids0.slice(0, pos).concat(feature.id).concat(ids0.slice(pos)));
      return Promise.resolve(feature);
    },
    byPos: (index: number): Feature | null => {
      return catalog.featureById(iids[key][index])
    },
    get length() {
      return iids[key].length
    },
    observable: function () {
      const th = this
      return storage.observable(key).pipe(map(() => {
        return th;
      }))
    },
    remove: function (feature: Feature): number {
      const ids0 = iids[key]
      const pos = ids0.indexOf(feature.id);
      if (pos === -1) return -1;
      updateIds(ids0.slice(0, pos).concat(ids0.slice(pos + 1)));
      feature.delete();
    },
    delete: function () {
      while (this.length > 0) {
        this.remove(this.byPos(0))
      }
      storage.delete(key);
      delete (iids[key])
    },
    reorder: function (from: number, to: number) {
      const ids0 = iids[key]
      updateIds(reorder(ids0, from, to));
    },
    [Symbol.iterator]: function () {
      const ids0 = iids[key]
      const _ids = [...ids0]; // don't reflect modifications after the iterator has been created
      let _current = 0;
      return {
        next: () => {
          return _current >= _ids.length
            ? {done: true, value: null,}
            : {done: false, value: this.byPos(_current++)};
        }
      };
    }
  }
};

