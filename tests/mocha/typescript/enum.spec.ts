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

enum StringEnum {
  // eslint-disable-next-line no-unused-vars
  A = 'c',
  // eslint-disable-next-line no-unused-vars
  B = 'd'
}

describe('enum type', () => {
  it('toString', () => {
    expect(StringEnum.A.toString()).to.be.eq('c');
  });
  it('enumerate', () => {
    expect(Object.keys(StringEnum)).to.be.eql(['A', 'B']);
  });
  it('by name', () => {
    const keyA: keyof typeof StringEnum = 'A';
    expect(StringEnum[keyA]).to.be.eq('c');
    const keyB: keyof typeof StringEnum = 'B';
    expect(StringEnum[keyB]).to.be.eq('d');
  });
  it('transA', () => {
    const transp = Object.keys(StringEnum).map(name => {
      const key = name as keyof typeof StringEnum;
      const val: string = StringEnum[key];
      return {[val]: key};
    });
    expect(transp).to.be.eql([{c: 'A'}, {d: 'B'}]);
  });
  it('transO', () => {
    const transp = Object.keys(StringEnum).reduce((acc, name) => {
      const key = name as keyof typeof StringEnum;
      const val: string = StringEnum[key];
      return {[val]: key, ...acc};
    }, {});
    expect(transp).to.be.eql({c: 'A', d: 'B'});
  });
});
