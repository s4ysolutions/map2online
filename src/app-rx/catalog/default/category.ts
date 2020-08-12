import {Catalog, Categories, Category, CategoryProps, ID, Route} from '../index';
import {KV} from '../../../kv-rx';
import {routesFactory} from './route';
import {makeId} from '../../../l10n/id';
import {map} from 'rxjs/operators';
import reorder from '../../../lib/reorder';
import {Wording} from '../../personalization/wording';

export const CATEGORY_ID_PREFIX = "c";

export const newCategoryProps = (wording: Wording): CategoryProps => ({
  id: makeId(),
  description: '',
  summary: '',
  title: wording.C('New category'),
  visible: true,
});

interface Updateable {
  update: () => void;
}

export const categoryFactory = (storage: KV, catalog: Catalog, wording: Wording, props: CategoryProps | null): Category & Updateable | null => {
  const p: CategoryProps = props === null ? newCategoryProps(wording) : {...props};
  const key = `${CATEGORY_ID_PREFIX}@${p.id}`;

  const th: Category & Updateable = {
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
    delete: function () {
      for (const route of Array.from(this.routes)) {
        this.routes.remove(route);
      }
      storage.delete(key);
      storage.delete(`vis@${p.id}`); // visibility
    },
    hasRoute: function (route: Route) {
      return this.routes.hasRoute(route)
    },
    observable: () => storage.observable<CategoryProps | null>(key)
      .pipe(
        map(props => props === null ? null : catalog.categoryById(props.id))
      ),
    routes: null,
    update: function () {
      storage.set(key, {...p});
    },
  };
  th.routes = routesFactory(storage, catalog, wording, th);
  return th;
};

const iids: Record<ID, ID[]> = {}

export const categoriesFactory = (storage: KV, catalog: Catalog, wording: Wording): Categories => {
  const key = 'cats'
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
      /*      }*/
    }
  };
  if (iids[key].length === 0) {
    const category = newCategoryProps(wording);
    storage.set(`${CATEGORY_ID_PREFIX}@${category.id}`, category);
    updateIds([category.id]);
  }
  return {
    add: function (props: CategoryProps | null, position?: number): Promise<Category> {
      const category = categoryFactory(storage, catalog, wording, props);
      category.update();
      const ids0 = iids[key]
      const pos = position || ids0.length;
      updateIds(ids0.slice(0, pos).concat(category.id).concat(ids0.slice(pos)));
      return Promise.resolve(category);
    },
    byPos: (index: number): Category | null => catalog.categoryById(iids[key][index]),
    get length() {
      return iids[key].length
    },
    observable: function () {
      return storage.observable('cats').pipe(map(() => this))
    },
    remove: function (category: Category): number {
      const ids0 = iids[key]
      const pos = ids0.indexOf(category.id);
      if (pos === -1) return -1;
      updateIds(ids0.slice(0, pos).concat(ids0.slice(pos + 1)));
      category.delete();
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
