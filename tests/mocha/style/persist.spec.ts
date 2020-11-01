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
import {KV} from '../../../src/kv-rx';
import memoryStorageFactory from '../../mocks/kv/memoryStorage';
import {map2StylesFactory} from '../../../src/style/default/styles';
import {Style} from '../../../src/style';

const map2styles = map2StylesFactory();
const map2DefaultStyle = map2styles.defaultStyle;

describe('Built in map2 styles', () => {
  let storage: KV;
  beforeEach(() => {
    storage = memoryStorageFactory();
  });
  it.skip('style is not supposed to be stored as object. At least built in style', () => {
    storage.set('s', map2DefaultStyle);
    const s: Style = storage.get('s', null);
    expect(s.lineStyle.color).to.be.eq(map2DefaultStyle.lineStyle.color);
    expect(s.iconStyle.color).to.be.eq(map2DefaultStyle.iconStyle.color);
    expect(s.iconStyle.icon.href).to.be.eq(map2DefaultStyle.iconStyle.icon.href);
    expect(s.iconStyle.icon).to.be.eq(map2DefaultStyle.iconStyle.icon);
  });
});
