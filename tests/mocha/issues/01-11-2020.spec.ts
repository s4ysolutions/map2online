/* eslint-disable no-magic-numbers,no-unused-expressions */
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

import {KV} from '../../../src/kv/sync';
import {Wording} from '../../../src/personalization/wording';
import {Map2Styles} from '../../../src/style';
import {Catalog, isLineString, isPoint, LineString} from '../../../src/catalog';
import memoryStorageFactory from '../../mocks/kv/memoryStorage';
import {wordingFactory} from '../../../src/personalization/wording/default';
import {map2StylesFactory} from '../../../src/style/default/styles';
import catalogFactory from '../../../src/catalog/default/catalog';
import fs from 'fs';
import path from 'path';
import {ImportedFolder} from '../../../src/importer';
import {parseKMLCoordinates, parseKMLString} from '../../../src/importer/default/kml-parser';
import {flatImportedFoldersToCategories} from '../../../src/importer/post-process';
import {importFlatFolders, ImportTo} from '../../../src/importer/import-to';
import {expect} from 'chai';

describe('26-10-2020 issues', () => {
  let kv: KV;
  let wording: Wording;
  let map2styles: Map2Styles;
  let catalog: Catalog;
  let kml: string;

  beforeEach(async () => {
    kv = memoryStorageFactory();
    wording = wordingFactory(kv);
    wording.currentRouteVariant = 'en';
    wording.currentCategoryVariant = 'en';
    map2styles = map2StylesFactory();
    catalog = catalogFactory(kv, wording, map2styles);
    kml = fs.readFileSync(path.join(__dirname, '..', '..', 'data', '01-11-2020.kml'), 'utf-8');
    const root: ImportedFolder = await parseKMLString({name: '01-11-2020.kml'} as File, kml, map2styles);
    const flat: ImportedFolder = flatImportedFoldersToCategories(root);
    await importFlatFolders(flat, ImportTo.ALL_CATEGORIES_TO_CATALOG, catalog, null, null);
    await catalog.categories.remove(catalog.categories.byPos(0));
  });

  it('parse coordinate', () => {
    const text = '14.080100,-5.398752,0';
    const kmlc = parseKMLCoordinates(text);
    expect(kmlc.length).to.be.eq(1);
  });

  it('features imported and converted to OL ', () => {
    expect(catalog.categories.length).to.be.eq(1);
    expect(catalog.categories.byPos(0).routes.length).to.be.eq(1);
    const features = catalog.categories.byPos(0).routes.byPos(0).features;
    expect(features.length).to.be.eq(7);
    expect(isPoint(features.byPos(0).geometry)).to.be.true;
    expect(isPoint(features.byPos(1).geometry)).to.be.true;
    expect(isPoint(features.byPos(2).geometry)).to.be.true;
    expect(isPoint(features.byPos(3).geometry)).to.be.true;
    expect(isPoint(features.byPos(4).geometry)).to.be.true;
    expect(isLineString(features.byPos(5).geometry)).to.be.true;
    expect(isLineString(features.byPos(6).geometry)).to.be.true;
    const l6g = features.byPos(5).geometry as LineString;
    expect(l6g.coordinates.length).to.be.eq(6);
    const l7g = features.byPos(6).geometry as LineString;
    expect(l7g.coordinates.length).to.be.eq(6);
  });
});
