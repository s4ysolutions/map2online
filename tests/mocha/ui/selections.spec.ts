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

import {expect} from 'chai';
import {KV} from '../../../src/kv/sync';
import {Wording} from '../../../src/personalization/wording';
import memoryStoragePromiseFactory, {MemoryStoragePromise} from '../../mocks/kv-promice/memoryStorage';
import {Map2Styles} from '../../../src/style';
import {CatalogStorage} from '../../../src/catalog/storage';
import memoryStorageFactory from '../../mocks/kv/memoryStorage';
import {map2StylesFactory} from '../../../src/style/default/styles';
import {wordingFactory} from '../../../src/personalization/wording/default';
import {CatalogStorageIndexedDb} from '../../../src/catalog/storage/indexeddb';
import {CatalogDefault} from '../../../src/catalog/default/catalog';
import {Catalog} from '../../../src/catalog';
import catalogUIFactory from '../../../src/ui/catalog/default';
import {CatalogUI} from '../../../src/ui/catalog';

describe('Selection categories and routes', () => {
  let kv: KV;
  let wording: Wording;
  let map2styles: Map2Styles;
  let kvPromise: MemoryStoragePromise;
  let catalogStorage: CatalogStorage;
  let catalog: Catalog;
  let catalogUI: CatalogUI;

  beforeEach(async () => {
    kv = memoryStorageFactory();
    map2styles = map2StylesFactory();
    // eslint-disable-next-line no-magic-numbers
    wording = wordingFactory(kv);
    kvPromise = memoryStoragePromiseFactory();
    catalogStorage = new CatalogStorageIndexedDb(kvPromise, map2styles);
    catalog = new CatalogDefault(
      catalogStorage,
      wording,
      map2styles,
      'test',
    );
    wording.currentRouteVariant = 'en';
    wording.currentCategoryVariant = 'en';
    catalogUI = catalogUIFactory(kv, catalog);
    await (catalog as CatalogDefault).init();
  });

  it('Initial default category and route', () => {
    const activeCategory = catalogUI.activeCategory;
    expect(activeCategory).to.be.not.null;
    expect(activeCategory?.title).to.be.eq(wording.C('New category'));
    const activeRoute = catalogUI.activeRoute;
    expect(activeRoute).to.be.not.null;
    expect(activeRoute?.title).to.be.eq(wording.R('New route'));
  });
});
