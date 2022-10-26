/* eslint-disable no-magic-numbers,no-unused-expressions,@typescript-eslint/no-non-null-assertion */
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
import {first} from 'rxjs/operators';
import {KvPromise} from '../../../src/kv/promise';
import memoryStoragePromiseFactory from '../../mocks/kv-promice/memoryStorage';
import {CatalogStorageIndexedDb} from '../../../src/catalog/storage/indexeddb';
import {CatalogStorage} from '../../../src/catalog/storage';
import {CatalogDefault} from '../../../src/catalog/default/catalog';
import {RichText} from '../../../src/richtext';
import {ID_NULL} from '../../../src/lib/id';

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

  describe('Features of the single route', () => {
    let category: Category;
    let route: Route;
    let feature1: Feature;

    beforeEach(async () => {
      await catalog.categories.byPos(0)!.routes.byPos(0)!.features.add({
        id: fid1,
        style: testStyle,
        description: RichText.makeEmpty(),
        geometry: {coordinate: {alt: 0, lat: 0, lon: 0}},
        summary: '',
        title: 't1',
        visible: true,
      });
      await catalog.categories.byPos(0)!.routes.byPos(0)?.features.add({
        id: fid2,
        style: testStyle,
        description: RichText.makeEmpty(),
        geometry: {coordinate: {alt: 0, lat: 0, lon: 0}},
        summary: '',
        title: 't1',
        visible: true,
      });
      category = catalog.categories.byPos(0)!;
      route = category.routes.byPos(0)!;
      feature1 = route.features.byPos(0)!;
    });

    it('Expected fixtures', () => {
      expect(catalog.categories.length).to.be.eq(1);
      expect(catalog.categories.byPos(0)!.routes.length).to.be.eq(1);
      expect(catalog.categories.byPos(0)!.routes.byPos(0)!.features.length).to.be.eq(2);
      expect(catalog.categories.byPos(0)!.routes.byPos(0)!.features.byPos(0)!.id).to.be.eq('fid1');
    });

    it('Visibility of features', (done) => {
      expect(catalog.visibleFeatures.length).to.be.eq(2);

      catalog.visibleFeaturesObservable(false).pipe(first())
        .subscribe((features) => {
          expect(features.length).to.be.eq(1);
          expect(catalog.visibleFeatures.length).to.be.eq(1);
          done();
        });
      feature1.visible = false;
    });

    it('Visibility of added features', (done) => {
      expect(catalog.visibleFeatures.length).to.be.eq(2);

      catalog.visibleFeaturesObservable(false).pipe(first())
        .subscribe((features) => {
          expect(catalog.visibleFeatures.length).to.be.eq(3);
          expect(features.length).to.be.not.null;
          expect(features.length).to.be.eq(3);
          done();
        });

      catalog.categories.byPos(0)!.routes.byPos(0)!.features.add({
        id: fid3,
        style: testStyle,
        description: RichText.makeEmpty(),
        geometry: {coordinate: {alt: 0, lat: 0, lon: 0}},
        summary: '',
        title: 't3',
        visible: true,
      }).then();
    });

    it('Visibility of removed features', (done) => {
      expect(catalog.visibleFeatures.length).to.be.eq(2);

      catalog.visibleFeaturesObservable(false).pipe(first())
        .subscribe((features) => {
          expect(catalog.visibleFeatures.length).to.be.eq(1);
          expect(features.length).to.be.not.null;
          expect(features.length).to.be.eq(1);
          done();
        });

      route.features.remove(feature1).then();
    });

    it('Visibility of route', (done) => {
      expect(catalog.visibleFeatures.length).to.be.eq(2);

      catalog.visibleFeaturesObservable(false).pipe(first())
        .subscribe((features) => {
          expect(features.length).to.be.eq(0);
          expect(catalog.visibleFeatures.length).to.be.eq(0);
          done();
        });

      route.visible = false;
    });
  });

  describe('Features of the 2 routes', () => {
    let category: Category;
    let route1: Route;
    let route2: Route;
    let feature11: Feature;

    beforeEach(async () => {
      category = catalog.categories.byPos(0)!;
      route1 = category.routes.byPos(0)!;
      await category.routes.add({
        description: RichText.makeEmpty(),
        id: ID_NULL,
        open: true,
        summary: '',
        title: 'r2',
        visible: true,
      });
      route2 = category.routes.byPos(1)!;

      await route1.features.add({
        id: fid1,
        style: testStyle,
        description: RichText.makeEmpty(),
        geometry: {coordinate: {alt: 0, lat: 0, lon: 0}},
        summary: '',
        title: 't1',
        visible: true,
      });

      await route1.features.add({
        id: fid2,
        style: testStyle,
        description: RichText.makeEmpty(),
        geometry: {coordinate: {alt: 0, lat: 0, lon: 0}},
        summary: '',
        title: 't1',
        visible: true,
      });

      await route2.features.add({
        id: fid3,
        style: testStyle,
        description: RichText.makeEmpty(),
        geometry: {coordinate: {alt: 0, lat: 0, lon: 0}},
        summary: '',
        title: 't3',
        visible: true,
      });

      feature11 = route1.features.byPos(0)!;
    });

    it('Expected fixtures', () => {
      expect(catalog.categories.length).to.be.eq(1);
      expect(catalog.categories.byPos(0)!.id === category.id).to.be.true;
      expect(category.routes.length).to.be.eq(2);
      expect(category.routes.byPos(0) === route1).to.be.true;
      expect(category.routes.byPos(1) === route2).to.be.true;
      expect(route1.features.length).to.be.eq(2);
      expect(route2.features.length).to.be.eq(1);
    });

    it('Visibility of features', (done) => {
      expect(catalog.visibleFeatures.length).to.be.eq(3);

      catalog.visibleFeaturesObservable(false).pipe(first())
        .subscribe((features) => {
          expect(features.length).to.be.eq(2);
          expect(catalog.visibleFeatures.length).to.be.eq(2);
          done();
        });

      feature11.visible = false;
    });

    it('Visibility of added features', (done) => {
      expect(catalog.visibleFeatures.length).to.be.eq(3);

      catalog.visibleFeaturesObservable(false).pipe(first())
        .subscribe((features) => {
          expect(catalog.visibleFeatures.length).to.be.eq(4);
          expect(features.length).to.be.not.null;
          expect(features.length).to.be.eq(4);
          done();
        });

      route2.features.add({
        id: fid4,
        style: testStyle,
        description: RichText.makeEmpty(),
        geometry: {coordinate: {alt: 0, lat: 0, lon: 0}},
        summary: '',
        title: 't4',
        visible: true,
      }).then();
    });

    it('Visibility of removed features', (done) => {
      expect(catalog.visibleFeatures.length).to.be.eq(3);

      catalog.visibleFeaturesObservable(false).pipe(first())
        .subscribe((features) => {
          expect(catalog.visibleFeatures.length).to.be.eq(2);
          expect(features.length).to.be.not.null;
          expect(features.length).to.be.eq(2);
          done();
        });

      route1.features.remove(feature11).then();
    });

    it('Visibility of routes', (done) => {
      expect(catalog.visibleFeatures.length).to.be.eq(3);

      catalog.visibleFeaturesObservable(false).pipe(first())
        .subscribe((features) => {
          expect(features.length).to.be.eq(1);
          expect(catalog.visibleFeatures.length).to.be.eq(1);
          done();
        });

      route1.visible = false;
    });
  });

  describe('Features of the 2 categories', () => {
    let category1: Category;
    let category2: Category;
    let route11: Route;
    let route12: Route;
    let route21: Route;
    let feature111: Feature;

    beforeEach(async () => {
      category1 = catalog.categories.byPos(0)!;
      await catalog.categories.add({description: [], id: ID_NULL, open: false, summary: '', title: '', visible: true});
      category2 = catalog.categories.byPos(1)!;
      route11 = category1.routes.byPos(0)!;
      await category1.routes.add({
        description: RichText.makeEmpty(),
        id: ID_NULL,
        open: true,
        summary: '',
        title: 'r2',
        visible: true,
      });
      route12 = category1.routes.byPos(1)!;
      route21 = category2.routes.byPos(0)!;

      await route11.features.add({
        id: fid1,
        style: testStyle,
        description: RichText.makeEmpty(),
        geometry: {coordinate: {alt: 0, lat: 0, lon: 0}},
        summary: '',
        title: 't1',
        visible: true,
      });

      await route11.features.add({
        id: fid2,
        style: testStyle,
        description: RichText.makeEmpty(),
        geometry: {coordinate: {alt: 0, lat: 0, lon: 0}},
        summary: '',
        title: 't1',
        visible: true,
      });

      await route12.features.add({
        id: fid3,
        style: testStyle,
        description: RichText.makeEmpty(),
        geometry: {coordinate: {alt: 0, lat: 0, lon: 0}},
        summary: '',
        title: 't3',
        visible: true,
      });

      await route21.features.add({
        id: fid4,
        style: testStyle,
        description: RichText.makeEmpty(),
        geometry: {coordinate: {alt: 0, lat: 0, lon: 0}},
        summary: '',
        title: 't3',
        visible: true,
      });

      feature111 = route11.features.byPos(0)!;
    });

    it('Expected fixtures', () => {
      expect(catalog.categories.length).to.be.eq(2);
      expect(catalog.categories.byPos(0)!.id === category1.id).to.be.true;
      expect(catalog.categories.byPos(1)!.id === category2.id).to.be.true;
      expect(category1.routes.length).to.be.eq(2);
      expect(category1.routes.byPos(0) === route11).to.be.true;
      expect(category1.routes.byPos(1) === route12).to.be.true;
      expect(route11.features.length).to.be.eq(2);
      expect(route12.features.length).to.be.eq(1);
      expect(route21.features.length).to.be.eq(1);
    });

    it('Visibility of features', (done) => {
      expect(catalog.visibleFeatures.length).to.be.eq(4);

      catalog.visibleFeaturesObservable(false).pipe(first())
        .subscribe((features) => {
          expect(features.length).to.be.eq(3);
          expect(catalog.visibleFeatures.length).to.be.eq(3);
          done();
        });

      feature111.visible = false;
    });

    it('Visibility of added features', (done) => {
      expect(catalog.visibleFeatures.length).to.be.eq(4);

      catalog.visibleFeaturesObservable(false).pipe(first())
        .subscribe((features) => {
          expect(catalog.visibleFeatures.length).to.be.eq(5);
          expect(features.length).to.be.not.null;
          expect(features.length).to.be.eq(5);
          done();
        });

      route21.features.add({
        id: fid5,
        style: testStyle,
        description: RichText.makeEmpty(),
        geometry: {coordinate: {alt: 0, lat: 0, lon: 0}},
        summary: '',
        title: 't5',
        visible: true,
      }).then();
    });

    it('Visibility of removed features', (done) => {
      expect(catalog.visibleFeatures.length).to.be.eq(4);

      catalog.visibleFeaturesObservable(false).pipe(first())
        .subscribe((features) => {
          expect(catalog.visibleFeatures.length).to.be.eq(3);
          expect(features.length).to.be.not.null;
          expect(features.length).to.be.eq(3);
          done();
        });
      route11.features.remove(feature111).then();
    });

    it('Visibility of routes', (done) => {
      expect(catalog.visibleFeatures.length).to.be.eq(4);

      catalog.visibleFeaturesObservable(false).pipe(first())
        .subscribe((features) => {
          expect(features.length).to.be.eq(2);
          expect(catalog.visibleFeatures.length).to.be.eq(2);
          done();
        });

      route11.visible = false;
    });

    it('Visibility of categories', (done) => {
      expect(catalog.visibleFeatures.length).to.be.eq(4);

      catalog.visibleFeaturesObservable(false).pipe(first())
        .subscribe((features) => {
          expect(features.length).to.be.eq(1);
          expect(catalog.visibleFeatures.length).to.be.eq(1);
          done();
        });

      category1.visible = false;
    });
  });
});
