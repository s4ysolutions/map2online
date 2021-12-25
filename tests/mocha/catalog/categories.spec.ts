/* eslint-disable no-magic-numbers */
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

import {makeEmptyRichText} from '../../../src/richtext';

const fid1 = 'fid1';
const fid2 = 'fid2';
const fid3 = 'fid3';
const fid4 = 'fid4';

import memoryStorageFactory from '../../mocks/kv/memoryStorage';
import memoryStoragePromiseFactory, {MemoryStoragePromise} from '../../mocks/kv-promice/memoryStorage';
import {expect} from 'chai';
import {wordingFactory} from '../../../src/personalization/wording/default';
import {Wording} from '../../../src/personalization/wording';
import {KV} from '../../../src/kv/sync';
import {Map2Styles, Style} from '../../../src/style';
import {map2StylesFactory} from '../../../src/style/default/styles';
import {KvPromise} from '../../../src/kv/promise';
import {CatalogStorage} from '../../../src/catalog/storage';
import {CatalogDefault} from '../../../src/catalog/default/catalog';
import {CatalogStorageIndexedDb} from '../../../src/catalog/storage/indexeddb';

describe('Catalog categories', () => {
  let kv: KV;
  let wording: Wording;
  let map2styles: Map2Styles;
  let testStyle: Style;
  let kvPromise: MemoryStoragePromise;
  let catalogStorage: CatalogStorage;

  beforeEach(() => {
    kv = memoryStorageFactory();
    map2styles = map2StylesFactory();
    // eslint-disable-next-line no-magic-numbers
    testStyle = map2styles.styles[2];
    wording = wordingFactory(kv);
    kvPromise = memoryStoragePromiseFactory();
    catalogStorage = new CatalogStorageIndexedDb(kvPromise, map2styles);
  });

  it('New Catalog must not have categories till wording initialized', async () => {
    const catalog = await CatalogDefault.getInstanceAsync(catalogStorage, wording, map2styles, 'test0');
    expect(catalog).has.property('categories');
    expect(catalog.categories).has.property('length', 0);
  });

  it('New Catalog must have 1 category if wording initialized', async () => {
    wording.currentRouteVariant = 'ru';
    wording.currentCategoryVariant = 'en';
    const catalog = await CatalogDefault.getInstanceAsync(catalogStorage, wording, map2styles, 'test0');
    expect(catalog).has.property('categories');
    expect(catalog.categories).has.property('length', 1);
    const category = catalog.categories.byPos(0);
    expect(category).has.property('routes');
    expect(category.routes).has.property('length', 1);
    const route = category.routes.byPos(0);
    expect(route).has.property('features');
    expect(route.features).has.property('length', 0);
  });

  it('Make sure kvPromise reflects the updates', async () => {
    wording.currentRouteVariant = 'ru';
    wording.currentCategoryVariant = 'en';
    const catalog = await CatalogDefault.getInstanceAsync(catalogStorage, wording, map2styles, 'test0');

    await catalog.categories.byPos(0).routes.byPos(0).features.add({
      id: fid1,
      style: testStyle,
      description: makeEmptyRichText(),
      geometry: {coordinate: {alt: 0, lat: 0, lon: 0}},
      summary: '',
      title: 't1',
      visible: true,
    });
    // eslint-disable-next-line max-statements-per-line
    await new Promise(rs => {
      setTimeout(rs, 500);
    });
    expect(Object.keys(kvPromise.mem).length).to.be.eq(6);

    const r11 = catalog.categories.byPos(0).routes.byPos(0);

    await catalog.categories.byPos(0).routes.byPos(0).features.add({
      id: fid2,
      style: testStyle,
      description: makeEmptyRichText(),
      geometry: {coordinate: {alt: 0, lat: 0, lon: 0}},
      summary: '',
      title: 't2',
      visible: true,
    });
    expect(Object.keys(kvPromise.mem).length).to.be.eq(7);

    const f3 = await catalog.categories.byPos(0).routes.byPos(0).features.add({
      id: fid3,
      style: testStyle,
      description: makeEmptyRichText(),
      geometry: {coordinate: {alt: 0, lat: 0, lon: 0}},
      summary: '',
      title: 't3',
      visible: true,
    });
    expect(Object.keys(kvPromise.mem).length).to.be.eq(8);

    const removed1 = await catalog.categories.byPos(0).routes.byPos(0).features.remove(f3);
    expect(removed1).to.be.eq(1);
    expect(Object.keys(kvPromise.mem).length).to.be.eq(7);

    const f4 = await catalog.categories.byPos(0).routes.byPos(0).features.add({
      id: fid4,
      style: testStyle,
      description: makeEmptyRichText(),
      geometry: {coordinate: {alt: 0, lat: 0, lon: 0}},
      summary: '',
      title: 't4',
      visible: true,
    });
    expect(Object.keys(kvPromise.mem).length).to.be.eq(8);

    const removed2 = await catalog.categories.byPos(0).routes.byPos(0).features.remove(f3);
    expect(removed2).to.be.eq(0);
    expect(Object.keys(kvPromise.mem).length).to.be.eq(8);

    const removed3 = await catalog.categories.byPos(0).routes.byPos(0).features.remove(f4);
    expect(removed3).to.be.eq(1);
    expect(Object.keys(kvPromise.mem).length).to.be.eq(7);

    await catalog.categories.byPos(0).routes.remove(r11);
    await new Promise(rs => {
      setTimeout(rs, 500);
    });
    expect(Object.keys(kvPromise.mem).length).to.be.eq(4);
  });

  it('Init from the store', async () => {
    wording.currentRouteVariant = 'ru';
    wording.currentCategoryVariant = 'en';
    const catalog = await CatalogDefault.getInstanceAsync(catalogStorage, wording, map2styles, 'test0');

    await catalog.categories.byPos(0).routes.byPos(0).features.add({
      id: fid1,
      style: testStyle,
      description: makeEmptyRichText(),
      geometry: {coordinate: {alt: 0, lat: 0, lon: 0}},
      summary: '',
      title: 't1',
      visible: true,
    });
    // eslint-disable-next-line max-statements-per-line
    await new Promise(rs => {
      setTimeout(rs, 500);
    });

    await catalog.categories.byPos(0).routes.byPos(0).features.add({
      id: fid2,
      style: testStyle,
      description: makeEmptyRichText(),
      geometry: {coordinate: {alt: 0, lat: 0, lon: 0}},
      summary: '',
      title: 't2',
      visible: true,
    });
    expect(Object.keys(kvPromise.mem).length).to.be.eq(7);

    await catalog.categories.byPos(0).routes.byPos(0).features.add({
      id: fid3,
      style: testStyle,
      description: makeEmptyRichText(),
      geometry: {coordinate: {alt: 0, lat: 0, lon: 0}},
      summary: '',
      title: 't3',
      visible: true,
    });
    expect(Object.keys(kvPromise.mem).length).to.be.eq(8);

    await catalog.categories.byPos(0).routes.byPos(0).features.add({
      id: fid4,
      style: testStyle,
      description: makeEmptyRichText(),
      geometry: {coordinate: {alt: 0, lat: 0, lon: 0}},
      summary: '',
      title: 't4',
      visible: true,
    });
    expect(Object.keys(kvPromise.mem).length).to.be.eq(9);

    const catalogStorage1 = new CatalogStorageIndexedDb(kvPromise, map2styles);
    const catalog1 = await CatalogDefault.getInstanceAsync(catalogStorage1, wording, map2styles, 'test0');
    expect(catalog1.categories.length).to.be.eq(1);
    expect(catalog1.categories.byPos(0).routes.length).to.be.eq(1);
    const features = catalog1.categories.byPos(0).routes.byPos(0).features;
    expect(features.length).to.be.eq(4);
    expect(features.byPos(0).id).to.be.eq(fid1);
    expect(features.byPos(1).id).to.be.eq(fid2);
    expect(features.byPos(2).id).to.be.eq(fid3);
    expect(features.byPos(3).id).to.be.eq(fid4);
  });

});
