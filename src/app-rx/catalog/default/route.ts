import {Catalog, ID, Route, RouteProps, Routes} from '../index';
import {KV} from '../../../kv-rx';
import {Subject} from 'rxjs';
import {featuresFactory} from './feature';

export const ROUTE_ID_PREFIX = "r";

export const routeFactory = (storage: KV, catalog: Catalog, props: RouteProps | null): Route | null => {
  const p = {...props};
  const update = () => storage.set(`${ROUTE_ID_PREFIX}@${p.id}`, p);
  return props === null
    ? null
    : {
      get description() {
        return p.description
      },
      id: p.id,
      set description(value) {
        update();
        p.description = value;
      },
      get summary() {
        return p.summary
      },
      set summary(value) {
        update();
        p.summary = value;
      },
      get title() {
        return p.title
      },
      set title(value) {
        update();
        p.title = value;
      },
      get visible() {
        return p.visible
      },
      set visible(value) {
        update();
        p.visible = value;
      },
      observable: () => storage.observable(`${ROUTE_ID_PREFIX}@${p.id}`),
      delete: () => {
      },
      features: featuresFactory(storage, catalog, storage.get<ID[]>(`ftids@${p.id}`, [])),
    };
};

export const routesFactory = (storage: KV, catalog: Catalog, ids: ID[]): Routes => {
  let ids0 = [...ids];
  const subject = new Subject<Routes>();
  return {
    add: function (props: RouteProps, position: number) {
      const pos = position || ids0.length;
      ids0 = ids0.slice(0, pos).concat(props.id).concat(ids0.slice(pos));
      subject.next(this);
    },
    byPos: (index: number): Route | null => catalog.routeById(ids0[index]),
    get length() {
      return ids0.length
    },
    hasRoute: (route: Route) => ids0.indexOf(route.id) >= 0,
    observable: () => subject,
    remove: function (category: Route): number {
      const pos = ids0.indexOf(category.id);
      if (pos === -1) return -1;
      ids0 = ids0.slice(0, pos).concat(ids0.slice(pos + 1));
      subject.next(this);
    },
    [Symbol.iterator]: () => {
      const _ids = [...ids0];
      const _me = this;
      let _current = 0;
      return {
        next: () => {
          return _current >= _ids.length
            ? {done: true, value: null,}
            : {done: false, value: _me.byPos(_current++)};
        }
      };
    }
  }
};
