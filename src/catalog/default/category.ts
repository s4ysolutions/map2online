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

import {Catalog, Categories, Category, CategoryProps, ID, Route} from '../index';
import {KV} from '../../kv-rx';
import {routesFactory} from './route';
import {makeId} from '../../lib/id';
import {map} from 'rxjs/operators';
import reorder from '../../lib/reorder';
import {Wording} from '../../personalization/wording';
import {Map2Styles} from '../../style';

export const CATEGORY_ID_PREFIX = 'c';

export const newCategoryProps = (wording: Wording): CategoryProps => ({
  id: makeId(),
  description: '',
  summary: '',
  title: wording.C('New category'),
  visible: true,
  open: false,
});

interface Updatebale {
  update: () => void;
}

export const categoryFactory = (storage: KV, catalog: Catalog, wording: Wording, styles: Map2Styles, routesIds: Record<ID, ID[]>, featuresIds: Record<ID, ID[]>, props: CategoryProps | null): Category & Updatebale | null => {
  const def = newCategoryProps(wording);
  const p: CategoryProps = props === null ? def : {...def, ...props};
  if (!p.id) {
    p.id = makeId();
  }
  const key = `${CATEGORY_ID_PREFIX}@${p.id}`;

  const th: Category & Updatebale = {
    get description() {
      return p.description;
    },
    set description(value) {
      p.description = value;
      this.update();
    },
    id: p.id,
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
    delete() {
      return this.routes.delete().then(() => {
        storage.delete(key);
        storage.delete(`vis@${p.id}`); // visibility
        storage.delete(`op@${p.id}`); // visibility
      });
    },
    hasRoute(route: Route) {
      return this.routes.hasRoute(route);
    },
    observable: () => storage.observable<CategoryProps | null>(key)
      .pipe(map(value => value === null ? null : catalog.categoryById(value.id))),
    update: () => {
      storage.set(key, p);
    },
    routes: null,
  };
  th.routes = routesFactory(storage, catalog, wording, styles, th, routesIds, featuresIds);
  return th;
};


export const categoriesFactory = (storage: KV, catalog: Catalog, wording: Wording, styles: Map2Styles, routesIds: Record<ID, ID[]>, featuresIds: Record<ID, ID[]>): Categories => {
  let prevIds: ID[] = [];
  const key = 'cats';
  const updateIds = (ids: ID[]) => {
    if (ids !== prevIds) {
      prevIds = ids.slice();
      storage.set(key, ids);
    }
  };
  const guardedIds = () => {
    if (prevIds.length > 0) {
      return prevIds;
    }
    prevIds = storage.get('cats', []);
    if (prevIds.length > 0) {
      return prevIds;
    }
    if (wording.isPersonalized) {
      const category = newCategoryProps(wording);
      storage.set(`${CATEGORY_ID_PREFIX}@${category.id}`, category);
      updateIds([category.id]);
    }
    return prevIds;
  };

  return {
    add(props: CategoryProps | null, position?: number): Promise<Category> {
      const category = categoryFactory(storage, catalog, wording, styles, routesIds, featuresIds, props);
      category.update();
      const pos = position || guardedIds().length;
      const ids0 = guardedIds();
      updateIds(ids0.slice(0, pos).concat(category.id)
        .concat(ids0.slice(pos)));
      return Promise.resolve(catalog.categoryById(category.id));
    },
    byPos: (index: number): Category | null => catalog.categoryById(guardedIds()[index]),
    get length() {
      return guardedIds().length;
    },
    observable() {
      return storage.observable('cats').pipe(map(() => this));
    },
    remove(category: Category): Promise<number> {
      const ids0 = guardedIds();
      const pos = ids0.indexOf(category.id);
      if (pos < 0) {
        return Promise.resolve(0);
      }
      updateIds(ids0.slice(0, pos).concat(ids0.slice(pos + 1)));
      return category.delete().then(() => 1);
    },
    reorder(from: number, to: number) {
      const ids0 = guardedIds();
      updateIds(reorder(ids0, from, to));
    },
    [Symbol.iterator]() {
      const ids0 = guardedIds();
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
