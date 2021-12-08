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

describe('Test string extension', () => {
  it('format', () => {
    // eslint-disable-next-line no-magic-numbers
    const formatted = 'A = {1} B = {2}'.format(10, 'b');
    expect(formatted).to.be.eq('A = 10 B = b');
  });
});
