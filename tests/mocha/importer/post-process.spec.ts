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
/* eslint-disable no-unused-expressions,camelcase,no-magic-numbers,prefer-destructuring */
import {ImportedFolder} from '../../../src/importer';
import {
  convertMixedFeaturesToFolder,
  flatImportedFoldersToCategories,
  removeEmptyImportedFolders,
} from '../../../src/importer/post-process';
import {expect} from 'chai';
import {FeatureProps} from '../../../src/catalog';
import {getImportedFolderStats} from '../../../src/importer/stats';
import fs from 'fs';
import path from 'path';
import {parseKMLString} from '../../../src/importer/default/kml-parser';
import {map2StylesFactory} from '../../../src/style/default/styles';
import {fileURLToPath} from 'url';
import { dirname } from 'path';
import {makeEmptyRichText} from '../../../src/richtext';
import log from '../../../src/log';

log.disableDebug();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const map2styles = map2StylesFactory();
const map2DefaultStyle = map2styles.defaultStyle;

describe('Import post-processing', () => {
  const fe1 = (): FeatureProps => ({
    style: map2DefaultStyle,
    description: 'feature 1'.convertToRichText(),
    geometry: undefined,
    id: '',
    summary: '',
    title: '',
    visible: false,
  });
  const fe2 = (): FeatureProps => ({
    style: map2DefaultStyle,
    description: 'feature 2'.convertToRichText(),
    geometry: undefined,
    id: '',
    summary: '',
    title: '',
    visible: false,
  });
  const fo11_empty = (): ImportedFolder => ({
    description: 'empty route 11'.convertToRichText(),
    features: [],
    folders: [],
    level: 0,
    name: '',
    parent: undefined,
    open: false,
    visible: true,
  });
  const fo11_with_features = (): ImportedFolder => ({
    description: 'route 11 with feature 1'.convertToRichText(),
    features: [fe1()],
    folders: [],
    level: 0,
    name: '',
    open: false,
    visible: true,
    parent: undefined,
  });
  const fo12_with_features = (): ImportedFolder => ({
    description: 'route 12 with feature 2'.convertToRichText(),
    features: [fe2()],
    folders: [],
    level: 0,
    name: '',
    open: false,
    visible: true,
    parent: undefined,
  });
  const fo11_fo11_with_features = (): ImportedFolder => ({
    description: 'cat 11 with route 11 with feature 1'.convertToRichText(),
    features: [],
    folders: [fo11_with_features()],
    level: 0,
    name: '',
    open: false,
    visible: true,
    parent: undefined,
  });
  const makeFolder = (description: RichText, folders: ImportedFolder[], features: FeatureProps[]): ImportedFolder => ({
    description,
    features,
    folders,
    level: 0,
    name: '',
    open: false,
    visible: true,
    parent: undefined,
  });
  const fo12_fo12_with_features = (): ImportedFolder => ({
    description: 'cat 12 with route 12 with feature'.convertToRichText(),
    features: [],
    folders: [fo12_with_features()],
    level: 0,
    name: '',
    open: false,
    visible: true,
    parent: undefined,
  });
  const doc_with_empty_route = (): ImportedFolder => ({
    description: 'document with empty route'.convertToRichText(),
    features: [],
    folders: [fo11_empty()],
    level: 0,
    name: '',
    open: false,
    visible: true,
    parent: undefined,
  });
  const doc_with_nonempty_route = (): ImportedFolder => ({
    description: 'document with non empty route'.convertToRichText(),
    features: [],
    folders: [fo11_with_features()],
    level: 0,
    name: '',
    open: false,
    visible: true,
    parent: undefined,
  });
  const doc_with_category_with_route_with_fetures = (): ImportedFolder => ({
    description: 'document with category 11'.convertToRichText(),
    features: [],
    folders: [fo11_fo11_with_features()],
    level: 0,
    name: '',
    open: false,
    visible: true,
    parent: undefined,
  });
  const doc_with_2_categories = (): ImportedFolder => ({
    description: 'document with 2 categories'.convertToRichText(),
    features: [],
    folders: [fo11_fo11_with_features(), fo12_fo12_with_features()],
    level: 0,
    name: '',
    open: false,
    visible: true,
    parent: undefined,
  });

  const doc_with_empty_and_non_empty_routes = (): ImportedFolder => ({
    description: 'document to skip'.convertToRichText(),
    features: [],
    folders: [fo11_with_features(), fo11_empty()],
    level: 0,
    name: '',
    open: false,
    visible: true,
    parent: undefined,
  });

  const levels_4 = (): ImportedFolder => ({
    description: 'root4levels'.convertToRichText(),
    features: [],
    folders: [doc_with_category_with_route_with_fetures()],
    level: 0,
    name: '',
    open: false,
    visible: true,
    parent: undefined,
  });

  describe('Filter out empty folders', () => {
    it('empty', () => {
      const root: ImportedFolder = {
        description: makeEmptyRichText(), features: [], folders: [], level: 0, name: '', open: false, visible: true, parent: undefined,
      };
      const r = removeEmptyImportedFolders(root);
      expect(r).to.be.not.null;
      expect(r.folders.length).to.be.eq(0);
    });
    it('document with empty folder', () => {
      const root: ImportedFolder = {
        description: makeEmptyRichText(), features: [], folders: [doc_with_empty_route()], level: 0, name: '', open: false, visible: true, parent: undefined,
      };
      const r = removeEmptyImportedFolders(root);
      expect(r).to.be.not.null;
      expect(r.folders.length).to.be.eq(0);
    });
    it('document with non empty folder', () => {
      const root: ImportedFolder = {
        description: 'root'.convertToRichText(),
        features: [],
        folders: [doc_with_nonempty_route()],
        level: 0,
        name: '',
        open: false,
        visible: true,
        parent: undefined,
      };
      const r = removeEmptyImportedFolders(root);
      expect(r).to.be.not.null;
      expect(r.folders.length).to.be.eq(1);
      expect(r.folders[0].features.length).to.be.eq(0);
      expect(r.folders[0].folders.length).to.be.eq(1);
      expect(r.folders[0].folders[0].features.length).to.be.eq(1);
      expect(r.folders[0].folders[0].folders.length).to.be.eq(0);
    });
    it('document with empty and non empty folders', () => {
      const root: ImportedFolder = {
        description: 'root'.convertToRichText(),
        features: [],
        folders: [doc_with_empty_and_non_empty_routes()],
        level: 0,
        name: '',
        open: false,
        visible: true,
        parent: undefined,
      };
      expect(root.folders.length).to.be.eq(1);
      expect(root.folders[0].folders.length).to.be.eq(2);
      expect(root.folders[0].folders[0].features.length).to.be.eq(1);
      expect(root.folders[0].folders[1].features.length).to.be.eq(0);
      const r = removeEmptyImportedFolders(root);
      expect(r).to.be.not.null;
      expect(r.folders.length).to.be.eq(1);
      expect(r.folders[0].features.length).to.be.eq(0);
      expect(r.folders[0].folders.length).to.be.eq(1);
      expect(r.folders[0].folders[0].features.length).to.be.eq(1);
      expect(r.folders[0].folders[0].folders.length).to.be.eq(0);
    });
    it('remove empty folder', () => {
      const root: ImportedFolder = {
        description: makeEmptyRichText(), features: [fe1()], folders: [fo11_empty()], level: 0, name: '', open: false, visible: true, parent: undefined,
      };

      const r = removeEmptyImportedFolders(root);
      expect(r).to.be.not.null;
      expect(r.folders.length).to.be.eq(0);
      expect(r.features.length).to.be.eq(1);
    });
  });

  describe('Get statistics', () => {
    it('empty', () => {
      const root: ImportedFolder = {
        description: makeEmptyRichText(), features: [], folders: [], level: 0, name: '', open: false, visible: true, parent: undefined,
      };

      const {depth, mixed, categories, routes} = getImportedFolderStats(root);
      expect(depth).to.be.eq(0);
      expect(mixed.length).to.be.eq(0);
      expect(categories).to.be.eq(0);
      expect(routes).to.be.eq(0);
    });
    it('features only', () => {
      const root: ImportedFolder = {
        description: makeEmptyRichText(), features: [fe1()], folders: [], level: 0, name: '', open: false, visible: true, parent: undefined,
      };

      const {depth, mixed, categories, routes} = getImportedFolderStats(root);
      expect(depth).to.be.eq(0);
      expect(mixed.length).to.be.eq(0);
      expect(categories).to.be.eq(0);
      expect(routes).to.be.eq(1);
    });
    it('features & empty category', () => {
      const root: ImportedFolder = {
        description: makeEmptyRichText(), features: [fe1()], folders: [fo11_empty()], level: 0, name: '', open: false, visible: true, parent: undefined,
      };

      const {depth, mixed, categories, routes} = getImportedFolderStats(root);
      expect(depth).to.be.eq(1);
      expect(mixed.length).to.be.eq(1);
      expect(categories).to.be.eq(0);
      expect(routes).to.be.eq(1);
    });
    it('features & non empty category', () => {
      const root: ImportedFolder = {
        description: makeEmptyRichText(), features: [fe1()], folders: [fo11_with_features()], level: 0, name: '', open: false, visible: true, parent: undefined,
      };

      const {depth, mixed, categories, routes} = getImportedFolderStats(root);
      expect(depth).to.be.eq(1);
      expect(mixed.length).to.be.eq(1);
      expect(categories).to.be.eq(1);
      expect(routes).to.be.eq(2);
    });
    it('doc with routes', () => {
      const root: ImportedFolder = {
        description: makeEmptyRichText(),
        features: [],
        folders: [doc_with_nonempty_route(), doc_with_nonempty_route()],
        level: 0,
        name: '',
        open: false,
        visible: true,
        parent: undefined,
      };

      const {depth, mixed, categories, routes} = getImportedFolderStats(root);
      expect(depth).to.be.eq(2);
      expect(mixed.length).to.be.eq(0);
      expect(categories).to.be.eq(2);
      expect(routes).to.be.eq(2);
    });
    it('doc with categories', () => {
      const root: ImportedFolder = {
        description: makeEmptyRichText(),
        features: [],
        folders: [doc_with_category_with_route_with_fetures()],
        level: 0,
        name: '',
        open: false,
        visible: true,
        parent: undefined,
      };

      const {depth, mixed, categories, routes} = getImportedFolderStats(root);
      expect(depth).to.be.eq(3);
      expect(mixed.length).to.be.eq(0);
      expect(categories).to.be.eq(1);
      expect(routes).to.be.eq(1);
    });
    it('4 levels', () => {
      const root: ImportedFolder = {
        description: 'root'.convertToRichText(),
        features: [],
        folders: [levels_4()],
        level: 0,
        name: '',
        open: false,
        visible: true,
        parent: undefined,
      };

      const {depth, categories, routes} = getImportedFolderStats(root);
      expect(depth).to.be.eq(4);
      expect(categories).to.be.eq(1);
      expect(routes).to.be.eq(1);
    });
  });
  describe('Remove mixed folders', () => {
    it('empty root', () => {
      const root: ImportedFolder = {
        description: makeEmptyRichText(), features: [], folders: [], level: 0, name: '', open: false, visible: true, parent: undefined,
      };
      const rr = convertMixedFeaturesToFolder(root);
      expect(rr).to.be.not.null;
      expect(rr.features.length).to.be.eq(0);
      expect(rr.folders.length).to.be.eq(0);
    });
    it('only features', () => {
      const root: ImportedFolder = {
        description: makeEmptyRichText(), features: [fe1()], folders: [], level: 0, name: '', open: false, visible: true, parent: undefined,
      };
      const rr = convertMixedFeaturesToFolder(root);
      expect(rr).to.be.not.null;
      expect(rr.features.length).to.be.eq(1);
      expect(rr.folders.length).to.be.eq(0);
    });
    it('only folders', () => {
      const root: ImportedFolder = {
        description: makeEmptyRichText(), features: [], folders: [fo11_empty()], level: 0, name: '', open: false, visible: true, parent: undefined,
      };
      const rr = convertMixedFeaturesToFolder(root);
      expect(rr).to.be.not.null;
      expect(rr.features.length).to.be.eq(0);
      expect(rr.folders.length).to.be.eq(1);
    });
    it('mixed', () => {
      const root: ImportedFolder = {
        description: makeEmptyRichText(), features: [fe1()], folders: [fo11_with_features()], level: 0, name: '', open: false, visible: true, parent: undefined,
      };
      const rr = convertMixedFeaturesToFolder(root);
      expect(rr).to.be.not.null;
      expect(rr.features.length).to.be.eq(0);
      expect(rr.folders.length).to.be.eq(2);
      expect(rr.folders[0].features.length).to.be.eq(1);
      expect(rr.folders[0].folders.length).to.be.eq(0);
    });
  });

  describe.skip('Flat folders (obsolete)', () => {
    it('empty root', () => {
      const root: ImportedFolder = {
        description: makeEmptyRichText(), features: [], folders: [], level: 0, name: '', open: false, visible: true, parent: undefined,
      };

      const rr = flatImportedFoldersToCategories(root);
      expect(rr.folders.length).to.be.eq(0);
    });
    it('root with features', () => {
      const root: ImportedFolder = {
        description: makeEmptyRichText(), features: [fe1()], folders: [], level: 0, name: '', open: false, visible: true, parent: undefined,
      };

      const rr = flatImportedFoldersToCategories(root);
      expect(rr.folders.length).to.be.eq(0);
      expect(rr.features.length).to.be.eq(1);
    });
    it('root with doc with folder with feature', () => {
      const root: ImportedFolder = {
        description: makeEmptyRichText(),
        features: [],
        folders: [doc_with_empty_and_non_empty_routes()],
        level: 0,
        name: '',
        open: false,
        visible: true,
        parent: undefined,
      };

      const {depth} = getImportedFolderStats(root);
      expect(depth).to.be.eq(2);
      const r = flatImportedFoldersToCategories(root);
      const {depth: rl} = getImportedFolderStats(root);
      expect(rl).to.be.eq(2);
      expect(r.folders.length).to.be.eq(1);
      expect(r.features.length).to.be.eq(0);
      expect(r.folders[0].folders.length).to.be.eq(2);
      expect(r.folders[0].features.length).to.be.eq(0);
      expect(r.folders[0].folders[0].features.length).to.be.eq(1);
      expect(r.folders[0].folders[1].features.length).to.be.eq(0);
    });
    it('root with doc with folder and subfolder with feature', () => {
      const root: ImportedFolder = {
        description: 'root'.convertToRichText(),
        features: [],
        folders: [doc_with_category_with_route_with_fetures()],
        level: 0,
        name: '',
        open: false,
        visible: true,
        parent: undefined,
      };

      const {depth} = getImportedFolderStats(root);
      expect(depth).to.be.eq(3);
      const r = flatImportedFoldersToCategories(root);
      const {depth: rl} = getImportedFolderStats(root);
      expect(rl).to.be.eq(2);
      expect(r.folders.length).to.be.eq(1);
      expect(r.features.length).to.be.eq(0);
      expect(r.folders[0].folders.length).to.be.eq(1);
      expect(r.folders[0].folders[0].features.length).to.be.eq(1);
    });
    it('0 levels, 2 features', () => {
      const root: ImportedFolder = {
        description: 'root'.convertToRichText(), features: [fe1(), fe2()],
        folders: [], level: 0, name: '', open: false, visible: true, parent: undefined,
      };
      const {depth} = getImportedFolderStats(root);
      expect(depth).to.be.eq(0);
      const r = flatImportedFoldersToCategories(root);
      const {depth: rl} = getImportedFolderStats(root);
      expect(rl).to.be.eq(0);
      expect(r.folders.length).to.be.eq(0);
      expect(r.features.length).to.be.eq(2);
    });
    it('1 level, 2 routes', () => {
      const root: ImportedFolder = {
        description: 'root'.convertToRichText(), features: [],
        folders: [fo11_with_features(), fo12_with_features()], level: 0, name: '', open: false, visible: true, parent: undefined,
      };
      const {depth} = getImportedFolderStats(root);
      expect(depth).to.be.eq(1);
      const r = flatImportedFoldersToCategories(root);
      const {depth: rl} = getImportedFolderStats(root);
      expect(rl).to.be.eq(1);
      expect(r.folders.length).to.be.eq(2);
      expect(r.features.length).to.be.eq(0);
    });
    it('2 levels, 2 categories', () => {
      const root: ImportedFolder = {
        description: 'root'.convertToRichText(), features: [],
        folders: [fo11_fo11_with_features(), fo12_fo12_with_features()], level: 0, name: '', open: false, visible: true, parent: undefined,
      };
      const {depth} = getImportedFolderStats(root);
      expect(depth).to.be.eq(2);
      const r = flatImportedFoldersToCategories(root);
      const {depth: rl} = getImportedFolderStats(root);
      expect(rl).to.be.eq(2);
      expect(r.folders.length).to.be.eq(2);
      expect(r.features.length).to.be.eq(0);
    });
    it('3 levels, one doc with 2 categories', () => {
      const root: ImportedFolder = {
        description: 'root'.convertToRichText(),
        features: [],
        folders: [makeFolder('doc', [fo11_fo11_with_features(), fo12_fo12_with_features()], [])],
        level: 0,
        name: '',
        open: false,
        visible: true,
        parent: undefined,
      };
      const {depth} = getImportedFolderStats(root);
      expect(depth).to.be.eq(3);
      const r = flatImportedFoldersToCategories(root);
      const {depth: rl} = getImportedFolderStats(root);
      expect(rl).to.be.eq(2);
      expect(r.folders.length).to.be.eq(2);
      expect(r.features.length).to.be.eq(0);
      expect(r.folders[0].folders.length).to.be.eq(1);
      expect(r.folders[1].folders.length).to.be.eq(1);
      expect(r.folders[0].folders[0].folders.length).to.be.eq(0);
      expect(r.folders[1].folders[0].folders.length).to.be.eq(0);
      expect(r.folders[0].folders[0].features.length).to.be.eq(1);
      expect(r.folders[1].folders[0].features.length).to.be.eq(1);
    });
    it('3 levels, two docs with 2 categories', () => {
      const root: ImportedFolder = {
        description: 'root'.convertToRichText(),
        features: [],
        folders: [
          makeFolder('doc', [fo11_fo11_with_features(), fo12_fo12_with_features()], []),
          makeFolder('doc', [fo11_fo11_with_features(), fo12_fo12_with_features()], []),
        ],
        level: 0,
        name: '',
        open: false,
        visible: true,
        parent: undefined,
      };
      const {depth} = getImportedFolderStats(root);
      expect(depth).to.be.eq(3);
      const r = flatImportedFoldersToCategories(root);
      const {depth: rl} = getImportedFolderStats(root);
      expect(rl).to.be.eq(2);
      expect(r.folders.length).to.be.eq(4);
      expect(r.features.length).to.be.eq(0);
      expect(r.folders[0].folders.length).to.be.eq(1);
      expect(r.folders[1].folders.length).to.be.eq(1);
      expect(r.folders[2].folders.length).to.be.eq(1);
      expect(r.folders[3].folders.length).to.be.eq(1);
      expect(r.folders[0].folders[0].folders.length).to.be.eq(0);
      expect(r.folders[1].folders[0].folders.length).to.be.eq(0);
      expect(r.folders[2].folders[0].folders.length).to.be.eq(0);
      expect(r.folders[3].folders[0].folders.length).to.be.eq(0);
      expect(r.folders[0].folders[0].features.length).to.be.eq(1);
      expect(r.folders[1].folders[0].features.length).to.be.eq(1);
      expect(r.folders[2].folders[0].features.length).to.be.eq(1);
      expect(r.folders[3].folders[0].features.length).to.be.eq(1);
    });
    it('3 levels, one doc with 2 categories and 1 route', () => {
      const root: ImportedFolder = {
        description: 'root'.convertToRichText(),
        features: [],
        folders: [
          makeFolder(
            'doc',
            [
              fo11_fo11_with_features(),
              fo12_fo12_with_features(),
              makeFolder('route', [], [fe1()]),
            ],
            [],
          ),
        ],
        level: 0,
        name: '',
        open: false,
        visible: true,
        parent: undefined,
      };
      const {depth} = getImportedFolderStats(root);
      expect(depth).to.be.eq(3);
      const r = flatImportedFoldersToCategories(root);
      const {depth: rl} = getImportedFolderStats(root);
      expect(rl).to.be.eq(2);
      expect(r.folders.length).to.be.eq(3);
      expect(r.features.length).to.be.eq(0);
      expect(r.folders[0].folders.length).to.be.eq(1);
      expect(r.folders[1].folders.length).to.be.eq(1);
      expect(r.folders[2].folders.length).to.be.eq(0);
      expect(r.folders[2].features.length).to.be.eq(1);
      expect(r.folders[0].folders[0].folders.length).to.be.eq(0);
      expect(r.folders[1].folders[0].folders.length).to.be.eq(0);
      expect(r.folders[0].folders[0].features.length).to.be.eq(1);
      expect(r.folders[1].folders[0].features.length).to.be.eq(1);
    });
    it('3 levels, one route and one doc with 2 categories and 1 route', () => {
      const root: ImportedFolder = {
        description: 'root'.convertToRichText(),
        features: [],
        folders: [
          makeFolder(
            'doc',
            [
              fo11_fo11_with_features(),
              fo12_fo12_with_features(),
              makeFolder('route 1', [], [fe1()]),
            ],
            [],
          ),
          makeFolder('route 2', [], [fe1()]),
        ],
        level: 0,
        name: '',
        open: false,
        visible: true,
        parent: undefined,
      };
      const {depth} = getImportedFolderStats(root);
      expect(depth).to.be.eq(3);
      const r = flatImportedFoldersToCategories(root);
      const {depth: rl} = getImportedFolderStats(root);
      expect(rl).to.be.eq(2);
      expect(r.folders.length).to.be.eq(4);
      expect(r.features.length).to.be.eq(0);
      expect(r.folders[0].folders.length).to.be.eq(1);
      expect(r.folders[1].folders.length).to.be.eq(1);
      expect(r.folders[2].folders.length).to.be.eq(0);
      expect(r.folders[2].features.length).to.be.eq(1);
      expect(r.folders[3].folders.length).to.be.eq(0);
      expect(r.folders[3].features.length).to.be.eq(1);
      expect(r.folders[0].folders[0].folders.length).to.be.eq(0);
      expect(r.folders[1].folders[0].folders.length).to.be.eq(0);
      expect(r.folders[0].folders[0].features.length).to.be.eq(1);
      expect(r.folders[1].folders[0].features.length).to.be.eq(1);
    });
    it('4 levels', () => {
      const root: ImportedFolder = {
        description: 'root'.convertToRichText(), features: [],
        folders: [levels_4(), fo11_with_features(), fo11_empty()], level: 0, name: '', parent: undefined,
        open: false,
        visible: true,
      };

      const {depth} = getImportedFolderStats(root);
      expect(depth).to.be.eq(4);
      const r = flatImportedFoldersToCategories(root);
      const {depth: rl} = getImportedFolderStats(root);
      expect(rl).to.be.eq(2);
      expect(r.folders.length).to.be.eq(3);
      expect(r.features.length).to.be.eq(0);
      expect(r.folders[0].folders.length).to.be.eq(1);
      expect(r.folders[0].folders[0].features.length).to.be.eq(1);
    });
  });
  describe('Flat folders', () => {
    it('flat 3 levels file', async () => {
      const removeTopFolder = (root: ImportedFolder): ImportedFolder => {
        const [r] = root.folders;
        r.parent = null;
        return r;
      };
      const fileName = '3-levels-mixed.kml';
      const kml: string = fs.readFileSync(path.join(__dirname, '..', '..', 'data', fileName), 'utf-8');
      const root: ImportedFolder = convertMixedFeaturesToFolder(removeTopFolder(await parseKMLString({name: fileName} as File, kml, map2styles)));
      const r = flatImportedFoldersToCategories(root);
      expect(r.folders.length).to.be.eq(2);
    });
  });
});
