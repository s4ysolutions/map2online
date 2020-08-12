import {Catalog, Category, ID, Route, RouteProps, Routes} from '../index';
import {KV} from '../../../kv-rx';
import {featuresFactory} from './feature';
import {makeId} from '../../../l10n/id';
import {map} from 'rxjs/operators';
import reorder from '../../../lib/reorder';
import {Wording} from '../../personalization/wording';

export const ROUTE_ID_PREFIX = "r";
export const ROUTES_ID_PREFIX = "rs";

const newRouteProps = (wording: Wording): RouteProps => ({
  id: makeId(),
  description: '',
  summary: '',
  title: wording.R('New route'),
  visible: true,
});

interface Updateable {
  update: () => void;
}

export const routeFactory = (storage: KV, catalog: Catalog, wording: Wording, props: RouteProps | null): Route & Updateable | null => {
  const p: RouteProps = props === null ? newRouteProps(wording) : {...props};
  const key = `${ROUTE_ID_PREFIX}@${p.id}`;
  const th: Route & Updateable = {
    get description() {
      return p.description
    },
    id: p.id,
    set description(value) {
      p.description = value;
      this.update();
    },
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
    observable: () => storage.observable<RouteProps | null>(key)
      .pipe(
        map(props => props === null ? null : catalog.routeById(props.id))
      ),
    delete() {
      console.log('debug delete route', this.features)
      if (this.features) {
        for (const feature of Array.from(this.features)) {
          console.log('debug route remove feature', feature)
          this.features.remove(feature);
        }
      }
      storage.delete(key);
      storage.delete(`vis@${p.id}`); // visibility
      storage.delete(`op@${p.id}`); // expand
    },
    features: null,
    update: function () {
      storage.set(key, p);
    }
  };
  th.features = featuresFactory(storage, catalog, th);
  return th;
};

const iids: Record<ID, ID[]> = {}

export const routesFactory = (storage: KV, catalog: Catalog, wording: Wording, category: Category): Routes => {
  const key = `${ROUTES_ID_PREFIX}@${category.id}`;
  iids[key] = storage.get<ID[]>(key, []);
  const updateIds = (ids: ID[]) => {
    if (ids !== iids[key]) {
      /*
      if (ids.length === 0) {
        storage.delete(key);
        delete (iids[key])
      } else {
       */
        iids[key] = ids.slice();
        storage.set(key, ids);
      /* } */
    }
  };
  if (iids[key].length === 0) {
    const route = newRouteProps(wording);
    storage.set(`${ROUTE_ID_PREFIX}@${route.id}`, route);
    updateIds([route.id]);
  }
  return {
    add: function (props: RouteProps, position: number) {
      const route = routeFactory(storage, catalog, wording, props);
      route.update();
      const ids0 = iids[key]
      const pos = position || ids0.length;
      updateIds(ids0.slice(0, pos).concat(route.id).concat(ids0.slice(pos)));
      return Promise.resolve(route);
    },
    byPos: (index: number): Route | null => catalog.routeById(iids[key][index]),
    get length() {
      return iids[key].length
    },
    hasRoute: (route: Route) => iids[key].indexOf(route.id) >= 0,
    observable: function () {
      return storage.observable(key).pipe(map(() => this))
    },
    remove: function (route: Route): number {
      const ids0 = iids[key]
      const pos = ids0.indexOf(route.id);
      if (pos === -1) return -1;
      updateIds(ids0.slice(0, pos).concat(ids0.slice(pos + 1)));
      route.delete();
    },
    reorder: function (from: number, to: number) {
      const ids0 = iids[key]
      updateIds(reorder(ids0, from, to));
    },
    [Symbol.iterator]: function () {
      const ids0 = iids[key]
      const _ids = [...ids0];
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
