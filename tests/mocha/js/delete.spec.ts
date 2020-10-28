/* eslint-disable */
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

describe('JS features', () => {
  it('delete object prop', () => {
    const o = {a: 1, b: 2};
    expect(o).to.haveOwnProperty('a', 1);
    expect(o).to.has.property('a', 1);
    expect(o.a).to.be.eq(1);
    delete o.a;
    expect(o).to.not.haveOwnProperty('a');
    expect(o).to.not.has.property('a');
    expect(o.a).to.be.undefined;
  });
  it('set object prop to undefined', () => {
    const o = {a: 1, b: 2};
    expect(o).to.haveOwnProperty('a', 1);
    expect(o).to.has.property('a', 1);
    expect(o.a).to.be.eq(1);
    o.a = undefined;
    expect(o).to.haveOwnProperty('a');
    expect(o).to.has.property('a');
    expect(o.a).to.be.undefined;
  });
  it('delete non existing prop', () => {
    const o = {a: 1, b: 2} as {a: number, b: number, c?: number};
    expect(o).to.haveOwnProperty('a', 1);
    expect(o).to.has.property('a', 1);
    expect(o.a).to.be.eq(1);
    delete o.c;
    expect(o.c).to.be.undefined;
  });
});
