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
import {Map2Color, idToMap2Color, map2ColorToName} from '../../../src/style/colors';

describe('Built in map2 colors', () => {
  it('idToMap2Color', () => {
    expect(idToMap2Color['#4363d8ff']).to.be.eq(Map2Color.BLUE);
  });
  it('map2ColorToName', () => {
    expect(map2ColorToName[Map2Color.BLUE]).to.be.eq('BLUE');
  });
});
