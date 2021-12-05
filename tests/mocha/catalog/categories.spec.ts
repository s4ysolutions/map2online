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

import memoryStorageFactory from '../../mocks/kv/memoryStorage';
import memoryStoragePromiseFactory from '../../mocks/kv-promice/memoryStorage';
import {expect} from 'chai';
import {wordingFactory} from '../../../src/personalization/wording/default';
import {Wording} from '../../../src/personalization/wording';
import {KV} from '../../../src/kv/sync';
import {Map2Styles} from '../../../src/style';
import {map2StylesFactory} from '../../../src/style/default/styles';
import {KvPromise} from '../../../src/kv/promise';
import {CatalogStorage} from '../../../src/catalog/storage';
import {CatalogDefault} from '../../../src/catalog/default/catalog';
import {CatalogStorageIndexedDb} from '../../../src/catalog/storage/indexeddb';

describe('Catalog categories', () => {
  let kv: KV;
  let wording: Wording;
  let map2styles: Map2Styles;
  let kvPromise: KvPromise;
  let catalogStorage: CatalogStorage;

  beforeEach(() => {
    kv = memoryStorageFactory();
    map2styles = map2StylesFactory();
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
  });

});
