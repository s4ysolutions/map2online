/* eslint-disable no-unused-expressions,no-magic-numbers */
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

import '../../../src/extensions/array+serializePlainText';
import '../../../src/extensions/array+serializeRichText';
import '../../../src/extensions/string+richtext';
import '../../../src/extensions/string+format';
import {KV} from '../../../src/kv/sync';
import {Wording} from '../../../src/personalization/wording';
import {Map2Styles} from '../../../src/style';
import {Catalog} from '../../../src/catalog';
import memoryStorageFactory from '../../mocks/kv/memoryStorage';
import {wordingFactory} from '../../../src/personalization/wording/default';
import {map2StylesFactory} from '../../../src/style/default/styles';
import {getCategoriesKML, nc} from '../../../src/exporter/lib/kml';
import {ImportedFolder} from '../../../src/importer';
import {parseKMLString} from '../../../src/importer/default/kml-parser';
import {expect} from 'chai';
import {KvPromise} from '../../../src/kv/promise';
import {CatalogStorage} from '../../../src/catalog/storage';
import memoryStoragePromiseFactory from '../../mocks/kv-promice/memoryStorage';
import {CatalogStorageIndexedDb} from '../../../src/catalog/storage/indexeddb';
import {CatalogDefault} from '../../../src/catalog/default/catalog';
import {makeEmptyRichText} from '../../../src/richtext';

const TEST_STYLE_NO = 2;

describe('KML Exporter', () => {
  let kv: KV;
  let wording: Wording;
  let map2styles: Map2Styles;
  let kvPromise: KvPromise;
  let catalogStorage: CatalogStorage;
  let catalog: Catalog;

  beforeEach(async () => {
    kv = memoryStorageFactory();
    wording = wordingFactory(kv);
    wording.currentRouteVariant = 'en';
    wording.currentCategoryVariant = 'en';
    map2styles = map2StylesFactory();
    kvPromise = memoryStoragePromiseFactory();
    catalogStorage = new CatalogStorageIndexedDb(kvPromise, map2styles);
    catalog = await CatalogDefault.getInstanceAsync(catalogStorage, wording, map2styles, 'test0');
  });

  it('One feature, default style', async () => {
    const fid1 = 'fid1';
    const testStyle = map2styles.styles[TEST_STYLE_NO];

    await catalog.categories.byPos(0).routes.byPos(0).features.add({
      id: fid1,
      style: testStyle,
      description: makeEmptyRichText(),
      geometry: {coordinate: {alt: 0, lat: 0, lon: 0}},
      summary: '',
      title: 't1',
      visible: true,
    });

    const testf = catalog.featureById(fid1);
    expect(testf.style.id).to.be.eq(testStyle.id);
    expect(testf.style.iconStyle.icon.toString().indexOf('fill="%23f58231ff"')).to.be.greaterThan(0);
    const kml = getCategoriesKML(Array.from(catalog.categories));
    expect(kml.indexOf('fill="%23f58231ff"')).to.be.greaterThan(0);
    const root: ImportedFolder = await parseKMLString({name: 'testStyleFile'} as File, kml, map2styles);
    expect(root.folders.length).to.be.eq(1);
    const doc = root.folders[0];
    const categories = doc.folders;
    expect(categories.length).to.be.eq(1);
    const routes = categories[0].folders;
    expect(routes.length).to.be.eq(1);
    const {features} = routes[0];
    expect(features.length).to.be.eq(1);
    const feature = features[0];
    expect(feature.id).to.be.null; // eq(fid1);
    expect(feature.style.id).to.be.eq(testStyle.id);
    expect(feature.style.iconStyle.icon.toString().indexOf('fill="%23f58231ff"')).to.be.greaterThan(0);
    const map2style = map2styles.findEq(feature.style);
    expect(map2style).to.be.not.null;
  });
  it('color of 5 length', () => {
    const ci = '12345';
    const co = nc(ci);
    expect(co).to.be.eq('#fff12345');
  });
  it('color of 6 length', () => {
    const ci = '123456';
    const co = nc(ci);
    expect(co).to.be.eq('#ff123456');
  });
  it('color of 8 length', () => {
    const ci = '123456ab';
    const co = nc(ci);
    expect(co).to.be.eq('#ab123456');
  });
  it('color of 9 length', () => {
    const ci = '123456abx';
    const co = nc(ci);
    expect(co).to.be.eq('#ab123456');
  });
});
