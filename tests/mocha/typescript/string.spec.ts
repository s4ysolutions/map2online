/* eslint-disable no-magic-numbers */
/*
 * Copyright 2021 s4y.solutions
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
import '../../../src/extensions/string+format';
import '../../../src/extensions/string+richtext';

describe('Test string extension', () => {
  it('format', () => {
    const formatted = 'A = {1} B = {2}'.format(10, 'b');
    expect(formatted).to.be.eq('A = 10 B = b');
  });
  it('toRichText', () => {
    const serialized = '[{"a": 1}, {"b": 2}]';
    const richText = serialized.parseToRichText();
    expect(richText.length).to.be.eq(2);
    expect(richText[0]).to.be.eql({a: 1});
    expect(richText[1]).to.be.eql({b: 2});
  });
  it('empty script is false', () => {
    const empty = '';
    expect(Boolean(empty)).to.be.false;
    expect(empty).not.to.be.true;
    expect(!empty).to.be.true;
    expect(empty && true).not.to.be.true;
    expect(empty || false).to.be.false;
    expect(empty ? 0 : 1).to.be.eq(1);
  });
});
