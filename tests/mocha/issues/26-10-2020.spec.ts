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

import {expect} from 'chai';
import {Catalog, Feature, FeatureProps} from '../../../src/catalog';
import memoryStorageFactory from '../../mocks/kv/memoryStorage';
import {KV} from '../../../src/kv/sync';
import {Wording} from '../../../src/personalization/wording';
import {Map2Styles} from '../../../src/style';
import {wordingFactory} from '../../../src/personalization/wording/default';
import {map2StylesFactory} from '../../../src/style/default/styles';
import {map} from 'rxjs/operators';
import {createOlStyle} from '../../../src/react/components/Ol/lib/styles';
import {KvPromise} from '../../../src/kv/promise';
import {CatalogStorage} from '../../../src/catalog/storage';
import memoryStoragePromiseFactory from '../../mocks/kv-promice/memoryStorage';
import {CatalogStorageIndexedDb} from '../../../src/catalog/storage/indexeddb';
import {CatalogDefault} from '../../../src/catalog/default/catalog';
import {makeEmptyRichText} from '../../../src/richtext';

describe.skip('26-10-2020 issues', () => {

  describe('UseVisible Features return features without style', () => {
    let kv: KV;
    let wording: Wording;
    let map2styles: Map2Styles;
    let kvPromise: KvPromise;
    let catalogStorage: CatalogStorage;
    let catalog: Catalog;

    const fid1 = 'fid1';

    beforeEach(async () => {
      kv = memoryStorageFactory();
      wording = wordingFactory(kv);
      wording.currentRouteVariant = 'en';
      wording.currentCategoryVariant = 'en';
      map2styles = map2StylesFactory();
      kvPromise = memoryStoragePromiseFactory();
      catalogStorage = new CatalogStorageIndexedDb(kvPromise, map2styles);
      catalog = await CatalogDefault.getInstanceAsync(catalogStorage, wording, map2styles, 'test0');
      await catalog.categories.byPos(0).routes.byPos(0).features.add({
        id: fid1,
        style: map2styles.defaultStyle,
        description: makeEmptyRichText(),
        geometry: {coordinate: {alt: 0, lat: 0, lon: 0}},
        summary: '',
        title: 't1',
        visible: true,
      });
    });

    it('Every feature in the catalog has style', () => {
      let features: Feature[] = [];
      for (const category of catalog.categories) {
        for (const route of category.routes) {
          features = features.concat(Array.from(route.features));
        }
      }
      expect(features.length).to.be.eq(1);
      expect(features[0].style).to.not.be.undefined;
      expect(features[0].style).to.has.property('id', map2styles.defaultStyle.id);
      expect(features[0]).to.not.has.property('styleId');
    });

    it('feature is stored with style id', async () => {
      const props: FeatureProps = await kvPromise.get(`f@${fid1}`, null);
      expect(props).to.be.not.null;
      expect(props).to.has.property('style', null);
      expect(props).to.has.property('styleId', map2styles.defaultStyle.id);
    });

    it('visible features has style', () => {
      const vis = catalog.visibleFeatures;
      expect(vis.length).to.be.eq(1);
      expect(vis[0].style).to.be.not.null;
    });

    it('fix "argument is not a function. Are you looking for `mapTo()`?"', () => {
      expect(catalog.visibleFeatures.length).to.be.eq(1);
      const fe = catalog.featureById(fid1);
      fe.visible = false;
      expect(catalog.visibleFeatures.length).to.be.eq(0);

      let f: Feature[] = null;
      const subscription = catalog
        .visibleFeaturesObservable(false)
        .pipe(map(fef => fef))
        .subscribe(fef => {
          f = fef;
        });
      fe.visible = true;
      expect(f).to.be.not.null;
      expect(f.length).to.be.eq(1);
      expect(f[0].visible).to.be.true;
      subscription.unsubscribe();
    });
  });
  /* disabled because of dependency on DOM */
  describe(' Unsupported style [object Object]', () => {

    let map2styles: Map2Styles;
    beforeEach(() => {
      map2styles = map2StylesFactory();
    });
    it('Create ol style from default style', () => {
      const style = map2styles.defaultStyle;
      createOlStyle(style.iconStyle, 'some label');
    });
  });
});
