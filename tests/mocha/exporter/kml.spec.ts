/* eslint-disable no-unused-expressions */
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

import {KV} from '../../../src/kv-rx';
import {Wording} from '../../../src/personalization/wording';
import {Map2Styles} from '../../../src/style';
import {Catalog} from '../../../src/catalog';
import memoryStorageFactory from '../../mocks/kv/memoryStorage';
import {wordingFactory} from '../../../src/personalization/wording/default';
import {map2StylesFactory} from '../../../src/style/default/styles';
import catalogFactory from '../../../src/catalog/default/catalog';
import {getCategoriesKML} from '../../../src/exporter/lib/kml';
import {ImportedFolder} from '../../../src/importer';
import {parseKMLString} from '../../../src/importer/default/kml-parser';
import {expect} from 'chai';

const TEST_STYLE_NO = 2;

describe('KML Exorter', () => {
  let kv: KV;
  let wording: Wording;
  let map2styles: Map2Styles;
  let catalog: Catalog;

  beforeEach(() => {
    kv = memoryStorageFactory();
    wording = wordingFactory(kv);
    wording.currentRouteVariant = 'en';
    wording.currentCategoryVariant = 'en';
    map2styles = map2StylesFactory();
    catalog = catalogFactory(kv, wording, map2styles);
  });

  it('One feature, default style', async () => {
    const fid1 = 'fid1';
    const testStyle = map2styles.styles[TEST_STYLE_NO];

    await catalog.categories.byPos(0).routes.byPos(0).features.add({
      id: fid1,
      style: testStyle,
      description: '',
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
});
