/*
 * Copyright 2019 s4y.solutions
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {Catalog, Category, ID, Route, RouteProps, Routes} from '../index';
import {KV} from '../../kv-rx';
import {featuresFactory} from './feature';
import {makeId} from '../../lib/id';
import {map} from 'rxjs/operators';
import reorder from '../../lib/reorder';
import {Wording} from '../../personalization/wording';
import {Map2Styles} from '../../style';

export const ROUTE_ID_PREFIX = 'r';
export const ROUTES_ID_PREFIX = 'rs';

const newRouteProps = (wording: Wording): RouteProps => ({
  id: makeId(),
  description: '',
  summary: '',
  title: wording.R('New route'),
  visible: true,
  open: true,
});

interface Updatebale {
  update: () => void;
}

export const routeFactory = (storage: KV, catalog: Catalog, wording: Wording, styles: Map2Styles, featuresIds: Record<ID, ID[]>, props: RouteProps | null): Route & Updatebale | null => {
  const def = newRouteProps(wording);
  const p: RouteProps = props === null ? def : {...def, ...props};
  if (!p.id) {
    p.id = makeId();
  }
  const key = `${ROUTE_ID_PREFIX}@${p.id}`;
  const th: Route & Updatebale = {
    id: p.id,
    ts: makeId(),
    get description() {
      return p.description;
    },
    set description(value) {
      p.description = value;
      this.update();
    },
    get summary() {
      return p.summary;
    },
    set summary(value) {
      p.summary = value;
      this.update();
    },
    get title() {
      return p.title;
    },
    set title(value) {
      p.title = value;
      this.update();
    },
    get visible() {
      return p.visible;
    },
    set visible(value) {
      p.visible = value;
      this.update();
    },
    get open() {
      return p.open;
    },
    set open(value) {
      p.open = value;
      this.update();
    },
    observable: () => storage.observable<RouteProps | null>(key)
      .pipe(map(value => value === null ? null : catalog.routeById(value.id))),
    delete() {
      return this.features.delete().then(() => {
        storage.delete(key);
        storage.delete(`vis@${p.id}`); // visibility
        storage.delete(`op@${p.id}`); // expand
      });
    },
    features: null,
    update: () => {
      storage.set(key, p);
    },
  };
  th.features = featuresFactory(storage, catalog, th, styles, featuresIds);
  return th;
};

// const iids: Record<ID, ID[]> = {};

export const routesFactory = (storage: KV, catalog: Catalog, wording: Wording, styles: Map2Styles, category: Category, routesIds: Record<ID, ID[]>, featuresIds: Record<ID, ID[]>): Routes => {
  const key = `${ROUTES_ID_PREFIX}@${category.id}`;
  routesIds[key] = storage.get<ID[]>(key, []);
  const updateIds = (ids: ID[]) => {
    if (ids !== routesIds[key]) {
      routesIds[key] = ids.slice();
      storage.set(key, ids);
    }
  };
  if (routesIds[key].length === 0) {
    const route = newRouteProps(wording);
    storage.set(`${ROUTE_ID_PREFIX}@${route.id}`, route);
    updateIds([route.id]);
  }
  return {
    add(props: RouteProps, position: number) {
      const route = routeFactory(storage, catalog, wording, styles, featuresIds, props);
      route.update();
      const ids0 = routesIds[key];
      const pos = position || ids0.length;
      updateIds(ids0.slice(0, pos).concat(route.id)
        .concat(ids0.slice(pos)));
      return Promise.resolve(catalog.routeById(route.id));
    },
    byPos: (index: number): Route | null => catalog.routeById(routesIds[key][index]),
    get length() {
      return routesIds[key] ? routesIds[key].length : 0;
    },
    hasRoute: (route: Route) => routesIds[key].indexOf(route.id) >= 0,
    observable() {
      return storage.observable(key).pipe(map(() => this));
    },
    remove(route: Route): Promise<number> {
      const ids0 = routesIds[key];
      const pos = ids0.indexOf(route.id);
      if (pos < 0) {
        return Promise.resolve(0);
      }
      updateIds(ids0.slice(0, pos).concat(ids0.slice(pos + 1)));
      return route.delete().then(() => 1);
    },
    delete() {
      return Promise.all(Array.from(this).map(route => this.remove(route)))
        .then(() => {
          storage.delete(key);
          delete routesIds[key];
        });
    },
    reorder(from: number, to: number) {
      const ids0 = routesIds[key];
      updateIds(reorder(ids0, from, to));
    },
    [Symbol.iterator]() {
      const ids0 = routesIds[key];
      const _ids = [...ids0];
      let _current = 0;
      return {
        next: () => _current >= _ids.length
          ? {done: true, value: null}
          : {done: false, value: this.byPos(_current++)},
      };
    },
  };
};
