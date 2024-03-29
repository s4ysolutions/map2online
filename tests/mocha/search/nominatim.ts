/*
 * Copyright 2022 s4y.solutions
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 * limitations under the License.
 */


import Nominatim from '../../../src/search/nominatim';
import MemSearchCache from '../../../src/search/mem-search-cache';

describe.skip('Nominatim', () => {
  it('Search Beograd', (done) => {
    const nominatim = new Nominatim(new MemSearchCache());
    // TODO: coordiantes fake
    nominatim.searchWithinArea('EPSG:3857', 'Beograd', 0, 0, 0, 0, 'en').then(done);
  });
});
