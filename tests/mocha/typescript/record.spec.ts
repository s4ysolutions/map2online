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

describe('record syntax', () => {
  it('can cast {} to Record', () => {
    const r = {} as Record<string, number>;
    r.a = 1;
    r.b = 2;
    expect(r.a).to.be.eq(1);
    // eslint-disable-next-line no-magic-numbers
    expect(r.b).to.be.eq(2);
  });
  it('can iterate over erntries', () => {
    const r = {} as Record<string, number>;
    r.a = 1;
    r.b = 2;
    for (const [s, n] of Object.entries(r)) {
      expect(r[s]).to.be.eq(n);
    }
  });
});
