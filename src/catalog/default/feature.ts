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
  Route,
} from '../index';
import {KV} from '../../kv/sync';
import {makeId} from '../../lib/id';
import {map} from 'rxjs/operators';
import reorder from '../../lib/reorder';
import T from '../../l10n';
import {Map2Styles} from '../../style';

export const FEATURE_ID_PREFIX = 'f';
export const FEATURES_ID_PREFIX = 'fs';


interface Updatebale {
  update: () => void;
}

export const featureFactory = (storage: KV, catalog: Catalog, props: FeatureProps | null, map2styles: Map2Styles, notifyFeaturesVisibility: () => void): Feature & Updatebale | null => {
  const def: FeatureProps = {
    id: makeId(),
    style: null,
    description: '',
    geometry: {coordinate: {alt: 0, lat: 0, lon: 0}},
    summary: '',
    title: '',
    visible: true,
  };
  const p: FeatureProps = props === null
    ? def
    : {
      ...def, ...props,
    };
  const key = `${FEATURE_ID_PREFIX}@${p.id}`;
  return {
    eq: (anotherFeature: Feature): boolean => {
      if (anotherFeature.id === p.id) {
        return true;
      }
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

    },
    get style() {
      return p.style;
    },
    set style(value) {
      p.style = value;
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
      const notify = value !== p.visible;
      p.visible = value;
      this.update();
      if (notify) {
        notifyFeaturesVisibility();
      }
    },
    updateCoordinates(coord) {
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
      .pipe(map(value => value === null ? null : catalog.featureById(value.id))),
    delete: () => new Promise<void>((rs) => {
      setTimeout(() => {
        storage.delete(key);
        storage.delete(`vis@${p.id}`); // visibility
        storage.delete(`op@${p.id}`); // visibility
        rs();
      }, 0);
    }),
    update () {
      const map2style = map2styles.findEq(p.style);
      if (map2style) {
        // eslint-disable-next-line no-unused-vars,@typescript-eslint/no-unused-vars
        const {style: _, ...pp} = p;
        storage.set(key, {...pp, styleId: map2style.id});
      } else {
        storage.set(key, p);
      }
    },
  };
};


export const featuresFactory = (storage: KV, catalog: Catalog, route: Route, styles: Map2Styles, featuresIds: Record<ID, ID[]>, notifyFeaturesVisibility: () => void): Features => {
  const key = `${FEATURES_ID_PREFIX}@${route.id}`;

  featuresIds[key] = storage.get<ID[]>(key, []);

  const storeIds = () => {
    storage.set(key, featuresIds[key]);
  };

  const updateIds = (ids: ID[]) => {
    if (ids !== featuresIds[key]) {
      featuresIds[key] = ids.slice();
    }
  };

  return {
    ts: makeId(),
    add(props: FeatureProps, position: number) {
      const p = {...props};
      if (!p.title) {
        p.title = `${isPoint(props.geometry) ? T`Point` : T`Line`} ${featuresIds[key].length + 1}`;
      }
      if (!p.id) {
        p.id = makeId();
      }
      const feature = featureFactory(storage, catalog, p, styles, notifyFeaturesVisibility);
      const ids0 = featuresIds[key];
      const pos = position || ids0.length;

      // update caches before triggering feature observable
      // in order to have id of the new feature in the ids array
      updateIds(ids0.slice(0, pos).concat(feature.id)
        .concat(ids0.slice(pos)));
      feature.update();
      storeIds();
      // featureById updates features global cache from storage
      return Promise.resolve(catalog.featureById(feature.id)).then(f => {
        notifyFeaturesVisibility();
        return f;
      });
    },
    byPos: (index: number): Feature | null => catalog.featureById(featuresIds[key][index]),
    get length() {
      return featuresIds[key] ? featuresIds[key].length : 0;
    },
    observable() {
      return storage.observable(key).pipe(map(() => this));
    },
    remove(feature: Feature): Promise<number> {
      const ids0 = featuresIds[key];
      const pos = ids0.indexOf(feature.id);
      if (pos < 0) {
        return Promise.resolve(0);
      }
      updateIds(ids0.slice(0, pos).concat(ids0.slice(pos + 1)));
      return feature.delete().then(() => {
        storeIds();
        notifyFeaturesVisibility();
        return 1; // count
      });
    },
    delete() {
      return Promise.all(Array.from(this).map(feature => this.remove(feature)))
        .then(() => {
          storage.delete(key);
          delete featuresIds[key];
        });
    },
    reorder(from: number, to: number) {
      const ids0 = featuresIds[key];
      updateIds(reorder(ids0, from, to));
      storeIds();
    },
    [Symbol.iterator]() {
      const ids0 = featuresIds[key];
      const _ids = [...ids0]; // don't reflect modifications after the iterator has been created
      let _current = 0;
      return {
        next: () => _current >= _ids.length
          ? {done: true, value: null}
          : {done: false, value: this.byPos(_current++)},
      };
    },
  };
};
