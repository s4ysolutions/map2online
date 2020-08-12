import {
  Catalog,
  Feature,
  FeatureProps,
  Features,
  ID,
  isCoordinate,
  isLineString,
  isPoint,
  LineString,
  Point,
  Route
} from '../index';
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

interface Updateable {
  update: () => void;
}

export const featureFactory = (storage: KV, catalog: Catalog, props: FeatureProps | null): Feature & Updateable | null => {
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
    id: p.id,
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
      if (isPoint(this.geometry) && isCoordinate(coord)) {
        // noinspection UnnecessaryLocalVariableJS
        const point: Point = {coordinate: coord};
        p.geometry = point;
      } else if (isLineString(this.geometry) && !isCoordinate(coord)) {
        // noinspection UnnecessaryLocalVariableJS
        const lineString: LineString = {coordinates: coord};
        p.geometry = lineString;
      }
      this.update();
    },
    observable: () => storage.observable<FeatureProps | null>(key)
      .pipe(
        map(props => props === null ? null : catalog.featureById(props.id))
      ),
    delete: () => {
      storage.delete(key);
      storage.delete(`vis@${p.id}`); // visibility
    },
    update: () => {
      storage.set(key, p)
    },
  };
};

const iids: Record<ID, ID[]> = {}

export const featuresFactory = (storage: KV, catalog: Catalog, route: Route): Features => {
  const key = `${FEATURES_ID_PREFIX}@${route.id}`;
  iids[key] = storage.get<ID[]>(key, []);
  const updateIds = (ids: ID[]) => {
    if (ids !== iids[key]) {
      /* to avoid handling the special case no .features
      if (ids.length === 0) {
        storage.delete(key);
        delete (iids[key])
      } else {
       */
      iids[key] = ids.slice();
      storage.set(key, ids);
      /*      }*/
    }
  };
  return {
    add: function (props: FeatureProps, position: number) {
      const feature = featureFactory(storage, catalog, props);
      if (!feature.title) {
        feature.title = (isPoint(props.geometry) ? T`Point` : T`Line`) + ` ${iids[key].length + 1}`
      }
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

