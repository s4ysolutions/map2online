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
import {Map2Styles, Style} from '../../../src/style';
import memoryStorageFactory from '../../mocks/kv/memoryStorage';
import {map2StylesFactory} from '../../../src/style/default/styles';
import {wordingFactory} from '../../../src/personalization/wording/default';
import {expect} from 'chai';
import {Catalog, Category, Feature, Route} from '../../../src/catalog';
import {Subscription} from 'rxjs';
import {KvPromise} from '../../../src/kv/promise';
import memoryStoragePromiseFactory from '../../mocks/kv-promice/memoryStorage';
import {CatalogStorageIndexedDb} from '../../../src/catalog/storage/indexeddb';
import {CatalogStorage} from '../../../src/catalog/storage';
import {CatalogDefault} from '../../../src/catalog/default/catalog';
import {makeEmptyRichText} from '../../../src/richtext';

const fid1 = 'fid1';
const fid2 = 'fid2';
const fid3 = 'fid3';
const fid4 = 'fid4';
const fid5 = 'fid4';

describe('Catalog visibleFeatures', () => {
  let kv: KV;
  let kvPromise: KvPromise;
  let wording: Wording;
  let map2styles: Map2Styles;
  let testStyle: Style;
  let catalog: Catalog;
  let subscription1: Subscription;
  let subscription2: Subscription;
  let subscription3: Subscription;
  let catalogStorage: CatalogStorage;

  beforeEach(async () => {
    kv = memoryStorageFactory();
    kvPromise = memoryStoragePromiseFactory();
    map2styles = map2StylesFactory();
    testStyle = map2styles.styles[2];
    wording = wordingFactory(kv);
    wording.currentRouteVariant = 'ru';
    wording.currentCategoryVariant = 'en';
    catalogStorage = new CatalogStorageIndexedDb(kvPromise, map2styles);
    catalog = await CatalogDefault.getInstanceAsync(catalogStorage, wording, map2styles, 'test0');
  });

  afterEach(() => {
    if (subscription1) {
      subscription1.unsubscribe();
      subscription1 = null;
    }
    if (subscription2) {
      subscription2.unsubscribe();
      subscription2 = null;
    }
    if (subscription3) {
      subscription3.unsubscribe();
      subscription3 = null;
    }
  });

  describe('Features of the single route', () => {
    let category: Category;
    let route: Route;
    let feature1: Feature;
    let feature2: Feature;

    beforeEach(async () => {
      await catalog.categories.byPos(0).routes.byPos(0).features.add({
        id: fid1,
        style: testStyle,
        description: makeEmptyRichText(),
        geometry: {coordinate: {alt: 0, lat: 0, lon: 0}},
        summary: '',
        title: 't1',
        visible: true,
      });
      await catalog.categories.byPos(0).routes.byPos(0).features.add({
        id: fid2,
        style: testStyle,
        description: makeEmptyRichText(),
        geometry: {coordinate: {alt: 0, lat: 0, lon: 0}},
        summary: '',
        title: 't1',
        visible: true,
      });
      category = catalog.categories.byPos(0);
      route = category.routes.byPos(0);
      feature1 = route.features.byPos(0);
      feature2 = route.features.byPos(1);
    });

    it('Expected fixtures', () => {
      expect(catalog.categories.length).to.be.eq(1);
      expect(catalog.categories.byPos(0).routes.length).to.be.eq(1);
      expect(catalog.categories.byPos(0).routes.byPos(0).features.length).to.be.eq(2);
      expect(catalog.categories.byPos(0).routes.byPos(0).features.byPos(0).id).to.be.eq('fid1');
    });

    it('Visibility of features', () => {
      expect(catalog.visibleFeatures.length).to.be.eq(2);

      let expected: Feature[] = null;
      subscription1 = catalog.visibleFeaturesObservable(false).subscribe((features) => {
        expected = features;
      });

      feature1.visible = false;

      expect(expected.length).to.be.eq(1);
      expect(catalog.visibleFeatures.length).to.be.eq(1);
    });

    it('Visibility of added features', async () => {
      expect(catalog.visibleFeatures.length).to.be.eq(2);

      let expected: Feature[] = null;
      subscription1 = catalog.visibleFeaturesObservable(false).subscribe((features) => {
        expected = features;
      });

      await catalog.categories.byPos(0).routes.byPos(0).features.add({
        id: fid3,
        style: testStyle,
        description: makeEmptyRichText(),
        geometry: {coordinate: {alt: 0, lat: 0, lon: 0}},
        summary: '',
        title: 't3',
        visible: true,
      });

      expect(catalog.visibleFeatures.length).to.be.eq(3);
      expect(expected.length).to.be.not.null;
      expect(expected.length).to.be.eq(3);
    });

    it('Visibility of removed features', async () => {
      expect(catalog.visibleFeatures.length).to.be.eq(2);

      let expected: Feature[] = null;
      subscription1 = catalog.visibleFeaturesObservable(false).subscribe((features) => {
        expected = features;
      });

      await route.features.remove(feature1);

      expect(catalog.visibleFeatures.length).to.be.eq(1);
      expect(expected.length).to.be.not.null;
      expect(expected.length).to.be.eq(1);
    });

    it('Visibility of route', () => {
      expect(catalog.visibleFeatures.length).to.be.eq(2);

      let expected: Feature[] = null;
      subscription1 = catalog.visibleFeaturesObservable(false).subscribe((features) => {
        expected = features;
      });

      route.visible = false;

      expect(expected.length).to.be.eq(0);
      expect(catalog.visibleFeatures.length).to.be.eq(0);
    });
  });

  describe('Features of the 2 routes', () => {
    let category: Category;
    let route1: Route;
    let route2: Route;
    let feature11: Feature;
    let feature12: Feature;
    let feature21: Feature;

    beforeEach(async () => {
      category = catalog.categories.byPos(0);
      route1 = category.routes.byPos(0);
      await category.routes.add({description: makeEmptyRichText(), id: null, open: true, summary: '', title: 'r2', visible: true});
      route2 = category.routes.byPos(1);

      await route1.features.add({
        id: fid1,
        style: testStyle,
        description: makeEmptyRichText(),
        geometry: {coordinate: {alt: 0, lat: 0, lon: 0}},
        summary: '',
        title: 't1',
        visible: true,
      });

      await route1.features.add({
        id: fid2,
        style: testStyle,
        description: makeEmptyRichText(),
        geometry: {coordinate: {alt: 0, lat: 0, lon: 0}},
        summary: '',
        title: 't1',
        visible: true,
      });

      await route2.features.add({
        id: fid3,
        style: testStyle,
        description: makeEmptyRichText(),
        geometry: {coordinate: {alt: 0, lat: 0, lon: 0}},
        summary: '',
        title: 't3',
        visible: true,
      });

      feature11 = route1.features.byPos(0);
      feature12 = route1.features.byPos(1);
      feature21 = route2.features.byPos(0);
    });

    it('Expected fixtures', () => {
      expect(catalog.categories.length).to.be.eq(1);
      expect(catalog.categories.byPos(0).id === category.id).to.be.true;
      expect(category.routes.length).to.be.eq(2);
      expect(category.routes.byPos(0) === route1).to.be.true;
      expect(category.routes.byPos(1) === route2).to.be.true;
      expect(route1.features.length).to.be.eq(2);
      expect(route2.features.length).to.be.eq(1);
    });

    it('Visibility of features', () => {
      expect(catalog.visibleFeatures.length).to.be.eq(3);

      let expected: Feature[] = null;
      subscription1 = catalog.visibleFeaturesObservable(false).subscribe((features) => {
        expected = features;
      });

      feature11.visible = false;
      expect(expected.length).to.be.eq(2);
      expect(catalog.visibleFeatures.length).to.be.eq(2);
    });

    it('Visibility of added features', async () => {
      expect(catalog.visibleFeatures.length).to.be.eq(3);

      let expected: Feature[] = null;
      subscription1 = catalog.visibleFeaturesObservable(false).subscribe((features) => {
        expected = features;
      });

      await route2.features.add({
        id: fid4,
        style: testStyle,
        description: makeEmptyRichText(),
        geometry: {coordinate: {alt: 0, lat: 0, lon: 0}},
        summary: '',
        title: 't4',
        visible: true,
      });

      expect(catalog.visibleFeatures.length).to.be.eq(4);
      expect(expected.length).to.be.not.null;
      expect(expected.length).to.be.eq(4);
    });

    it('Visibility of removed features', async () => {
      expect(catalog.visibleFeatures.length).to.be.eq(3);

      let expected: Feature[] = null;
      subscription1 = catalog.visibleFeaturesObservable(false).subscribe((features) => {
        expected = features;
      });

      await route1.features.remove(feature11);

      expect(catalog.visibleFeatures.length).to.be.eq(2);
      expect(expected.length).to.be.not.null;
      expect(expected.length).to.be.eq(2);
    });

    it('Visibility of routes', () => {
      expect(catalog.visibleFeatures.length).to.be.eq(3);

      let expected: Feature[] = null;
      subscription1 = catalog.visibleFeaturesObservable(false).subscribe((features) => {
        expected = features;
      });

      route1.visible = false;
      expect(expected.length).to.be.eq(1);
      expect(catalog.visibleFeatures.length).to.be.eq(1);
    });
  });

  describe('Features of the 2 categories', () => {
    let category1: Category;
    let category2: Category;
    let route11: Route;
    let route12: Route;
    let route21: Route;
    let feature111: Feature;
    let feature112: Feature;
    let feature121: Feature;
    let feature211: Feature;

    beforeEach(async () => {
      category1 = catalog.categories.byPos(0);
      await catalog.categories.add({description: [], id: null, open: false, summary: '', title: '', visible: true});
      category2 = catalog.categories.byPos(1);
      route11 = category1.routes.byPos(0);
      await category1.routes.add({description: makeEmptyRichText(), id: null, open: true, summary: '', title: 'r2', visible: true});
      route12 = category1.routes.byPos(1);
      route21 = category2.routes.byPos(0);

      await route11.features.add({
        id: fid1,
        style: testStyle,
        description: makeEmptyRichText(),
        geometry: {coordinate: {alt: 0, lat: 0, lon: 0}},
        summary: '',
        title: 't1',
        visible: true,
      });

      await route11.features.add({
        id: fid2,
        style: testStyle,
        description: makeEmptyRichText(),
        geometry: {coordinate: {alt: 0, lat: 0, lon: 0}},
        summary: '',
        title: 't1',
        visible: true,
      });

      await route12.features.add({
        id: fid3,
        style: testStyle,
        description: makeEmptyRichText(),
        geometry: {coordinate: {alt: 0, lat: 0, lon: 0}},
        summary: '',
        title: 't3',
        visible: true,
      });

      await route21.features.add({
        id: fid4,
        style: testStyle,
        description: makeEmptyRichText(),
        geometry: {coordinate: {alt: 0, lat: 0, lon: 0}},
        summary: '',
        title: 't3',
        visible: true,
      });

      feature111 = route11.features.byPos(0);
      feature112 = route11.features.byPos(1);
      feature121 = route12.features.byPos(0);
      feature211 = route21.features.byPos(0);
    });

    it('Expected fixtures', () => {
      expect(catalog.categories.length).to.be.eq(2);
      expect(catalog.categories.byPos(0).id === category1.id).to.be.true;
      expect(catalog.categories.byPos(1).id === category2.id).to.be.true;
      expect(category1.routes.length).to.be.eq(2);
      expect(category1.routes.byPos(0) === route11).to.be.true;
      expect(category1.routes.byPos(1) === route12).to.be.true;
      expect(route11.features.length).to.be.eq(2);
      expect(route12.features.length).to.be.eq(1);
      expect(route21.features.length).to.be.eq(1);
    });

    it('Visibility of features', () => {
      expect(catalog.visibleFeatures.length).to.be.eq(4);

      let expected: Feature[] = null;
      subscription1 = catalog.visibleFeaturesObservable(false).subscribe((features) => {
        expected = features;
      });

      feature111.visible = false;
      expect(expected.length).to.be.eq(3);
      expect(catalog.visibleFeatures.length).to.be.eq(3);
    });

    it('Visibility of added features', async () => {
      expect(catalog.visibleFeatures.length).to.be.eq(4);

      let expected: Feature[] = null;
      subscription1 = catalog.visibleFeaturesObservable(false).subscribe((features) => {
        expected = features;
      });

      await route21.features.add({
        id: fid5,
        style: testStyle,
        description: makeEmptyRichText(),
        geometry: {coordinate: {alt: 0, lat: 0, lon: 0}},
        summary: '',
        title: 't5',
        visible: true,
      });

      expect(catalog.visibleFeatures.length).to.be.eq(5);
      expect(expected.length).to.be.not.null;
      expect(expected.length).to.be.eq(5);
    });

    it('Visibility of removed features', async () => {
      expect(catalog.visibleFeatures.length).to.be.eq(4);

      let expected: Feature[] = null;
      subscription1 = catalog.visibleFeaturesObservable(false).subscribe((features) => {
        expected = features;
      });

      await route11.features.remove(feature111);

      expect(catalog.visibleFeatures.length).to.be.eq(3);
      expect(expected.length).to.be.not.null;
      expect(expected.length).to.be.eq(3);
    });

    it('Visibility of routes', () => {
      expect(catalog.visibleFeatures.length).to.be.eq(4);

      let expected: Feature[] = null;
      subscription1 = catalog.visibleFeaturesObservable(false).subscribe((features) => {
        expected = features;
      });

      route11.visible = false;
      expect(expected.length).to.be.eq(2);
      expect(catalog.visibleFeatures.length).to.be.eq(2);
    });

    it('Visibility of categories', () => {
      expect(catalog.visibleFeatures.length).to.be.eq(4);

      let expected: Feature[] = null;
      subscription1 = catalog.visibleFeaturesObservable(false).subscribe((features) => {
        expected = features;
      });

      category1.visible = false;
      expect(expected.length).to.be.eq(1);
      expect(catalog.visibleFeatures.length).to.be.eq(1);
    });
  });
});
