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
import catalogFactory from '../../../src/catalog/default/catalog';
import {expect} from 'chai';
import {wordingFactory} from '../../../src/personalization/wording/default';
import {Wording} from '../../../src/personalization/wording';
import {KV} from '../../../src/kv-rx';

describe('Catalog categories', () => {
  let storage: KV;
  let wording: Wording;

  beforeEach(() => {
    storage = memoryStorageFactory();
    wording = wordingFactory(storage);
  });

  it('New Catalog must not have categories till wording initialized', () => {
    const catalog = catalogFactory(storage, wording);
    expect(catalog).has.property('categories');
    expect(catalog.categories).has.property('length', 0);
  });

  it('New Catalog must have 1 category if wording initialized', () => {
    wording.currentRouteVariant = 'ru';
    wording.currentCategoryVariant = 'en';
    const catalog = catalogFactory(storage, wording);
    expect(catalog).has.property('categories');
    expect(catalog.categories).has.property('length', 1);
  });
});
