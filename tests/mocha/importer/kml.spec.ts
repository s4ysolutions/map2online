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
/* eslint-disable prefer-destructuring,no-unused-expressions,no-magic-numbers,camelcase */
import fs from 'fs';
import path from 'path';
import {expect} from 'chai';
import {nc, parseKMLString} from '../../../src/importer/default/kml-parser';
import {ImportedFolder} from '../../../src/importer';
import {Point} from '../../../src/catalog';
import {getImportedFolderStats} from '../../../src/importer/stats';
import {map2StylesFactory} from '../../../src/style/default/styles';
import {fileURLToPath} from 'url';
import { dirname } from 'path';
import log from '../../../src/log';

log.disableDebug();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const map2styles = map2StylesFactory();


describe('KML Importer', () => {
  it('rrb-like simple correct file with cdata', async () => {
    const fileName = 'simple-cdata.kml';
    const kml: string = fs.readFileSync(path.join(__dirname, '..', '..', 'data', fileName), 'utf-8');
    const root: ImportedFolder = await parseKMLString({name: fileName} as File, kml, map2styles);
    const doc: ImportedFolder = root.folders[0];
    const catFolders = doc.folders;
    const cat1: ImportedFolder = catFolders[0];
    expect(cat1.name).to.be.eq('cat1 name');
    expect(cat1.description.serializePlainText().trim()).to.be.eq('cat1 desc');
    const route11 = cat1.folders[0];
    expect(route11.name).to.be.eq('Route 11');
    expect(route11.description.serializePlainText().trim()).to.be.eq('Desc r11');
    const feature111 = route11.features[0];
    expect(feature111.title).to.be.eq('111');
    expect(feature111.description.serializePlainText().trim()).to.be.eq('Desc 111');
  });

  it('rrb-like simple correct file', async () => {
    const fileName = 'simple.kml';
    const kml: string = fs.readFileSync(path.join(__dirname, '..', '..', 'data', fileName), 'utf-8');
    const root: ImportedFolder = await parseKMLString({name: fileName} as File, kml, map2styles);

    expect(root.parent, 'root\'s parent must be null').to.be.null;
    expect(root.level).to.be.eq(0, 'root\'s level number must be 0');
    expect(fileName).to.be.eq(root.name, 'root node must be named by the file name');

    const rootFolders = root.folders;
    expect(rootFolders.length, 'there must be only one document imported').to.be.eq(1);
    const doc: ImportedFolder = root.folders[0];
    expect(doc.parent).to.be.eq(root);
    expect(doc.name).to.be.eq('');
    expect(doc.level).to.be.eq(1);

    const catFolders = doc.folders;
    expect(catFolders.length, 'there must be only one category imported').to.be.eq(1);
    const cat1: ImportedFolder = catFolders[0];
    expect(cat1.parent).to.be.eq(doc);
    expect(cat1.name).to.be.eq('Category 1');
    expect(cat1.folders.length).to.be.eq(2);

    expect(cat1.level).to.be.eq(2);
    const route11 = cat1.folders[0];
    expect(route11.parent).to.be.eq(cat1);
    expect(route11.level).to.be.eq(3);
    expect(route11.name).to.be.eq('Route 11');
    expect(route11.description.serializePlainText().trim()).to.be.eq('Desc r11');
    expect(route11.folders.length).to.be.eq(0);
    expect(route11.features.length).to.be.eq(2);
    expect(route11.features[0].title).to.be.eq('111');
    expect(route11.features[1].title).to.be.eq('112');
    expect(route11.features[0].description.serializePlainText().trim()).to.be.eq('Desc 111');
    expect(route11.features[1].description.serializePlainText().trim()).to.be.eq('Desc 112');
    const route12 = cat1.folders[1];
    expect(route12.parent).to.be.eq(cat1);
    expect(route12.level).to.be.eq(3);
    expect(route12.folders.length).to.be.eq(0);
    // expect(2).to.be.eq(route12.features.length, '2nd route must have 2 features');
    expect(route12.features.length, '2nd route must have 3 features').to.be.eq(3);
    expect(route12.name).to.be.eq('Route 12');
    expect(route12.description.serializePlainText().trim()).to.be.eq('Desc r12');
    expect(route12.features[0].id).to.be.null; // not.null;
    expect(route12.features[0].title).to.be.eq('121');
    expect(route12.features[0].description.serializePlainText().trim()).to.be.eq('Desc 121');
    expect(route12.features[1].id).to.be.null; // not.null;
    expect(route12.features[1].title).to.be.eq('122');
    expect(route12.features[1].description.serializePlainText().trim()).to.be.eq('Desc 122');
    // expect(route12.features[2].id, 'Absent id must be left in anyway').to.be.not.null;
    expect(route12.features[2].id).to.be.null; // not.null;
    expect(route12.features[2].title).to.be.eq('123');
    expect(route12.features[2].description.serializePlainText().trim(), 'Absent feature description must be empty string').to.be.eq('');
  });
  it('real rrb file', async () => {
    const fileName = 'rrb.kml';
    const kml: string = fs.readFileSync(path.join(__dirname, '..', '..', 'data', fileName), 'utf-8');
    const root: ImportedFolder = await parseKMLString({name: fileName} as File, kml, map2styles);

    expect(root.parent, 'root\'s parent must be null').to.be.null;
    expect(root.level).to.be.eq(0, 'root\'s level number must be 0');
    expect(root.name).to.be.eq(fileName, 'root node must be named by the file name');

    const rootFolders = root.folders;
    expect(rootFolders.length, 'there must be only one document imported').to.be.eq(1);
    const doc: ImportedFolder = root.folders[0];
    expect(doc.parent).to.be.eq(root);
    expect(doc.name).to.be.eq('');
    expect(doc.level).to.be.eq(1);

    const catFolders = doc.folders;
    expect(catFolders.length, 'there must be only one category imported').to.be.eq(1);
    const cat1: ImportedFolder = catFolders[0];
    expect(cat1.parent).to.be.eq(doc);
    expect(cat1.name).to.be.eq('Открывая Мангистау - 2019');
    expect(cat1.folders.length).to.be.eq(14);
    expect(cat1.level).to.be.eq(2);
    const route1_4 = cat1.folders[3];
    expect(route1_4.parent).to.be.eq(cat1);
    expect(route1_4.level).to.be.eq(3);
    expect(route1_4.name).to.be.eq('День 3');
    expect(route1_4.folders.length).to.be.eq(0);
    expect(route1_4.features.length).to.be.eq(72);
    expect((route1_4.features[0].geometry as Point).coordinate).to.have.property('lat', 5531457.004247706);
    expect((route1_4.features[0].geometry as Point).coordinate).to.have.property('lon', 5685847.820129507);
  });
  it('onlyfeatures file', async () => {
    const fileName = 'only-features.kml';
    const kml: string = fs.readFileSync(path.join(__dirname, '..', '..', 'data', fileName), 'utf-8');
    const root: ImportedFolder = await parseKMLString({name: fileName} as File, kml, map2styles);

    expect(root.parent, 'root\'s parent must be null').to.be.null;
    expect(root.folders.length, 'there must not be any category imported').to.be.eq(0);
    expect(root.features.length, 'there must be 5 features in the root folder').to.be.eq(5);
  });
  it('3 levels file with mixed features and folders', async () => {
    const fileName = '3-levels-mixed.kml';
    const kml: string = fs.readFileSync(path.join(__dirname, '..', '..', 'data', fileName), 'utf-8');
    const root: ImportedFolder = await parseKMLString({name: fileName} as File, kml, map2styles);

    expect(root.parent, 'root\'s parent must be null').to.be.null;

    const rootFolders = root.folders;
    expect(rootFolders.length, 'there must be only one document imported').to.be.eq(1);

    const doc: ImportedFolder = root.folders[0];
    expect(doc.parent).to.be.eq(root);
    expect(doc.name).to.be.eq('');
    expect(doc.level).to.be.eq(1);

    const catFolders = doc.folders;
    expect(catFolders.length, 'there must be 2 categories imported').to.be.eq(1);
    const cat1: ImportedFolder = catFolders[0];
    expect(cat1.parent).to.be.eq(doc);
    expect(cat1.folders.length).to.be.eq(2);
    expect(cat1.features.length).to.be.eq(0);
    expect(cat1.level).to.be.eq(2);

    const route11 = cat1.folders[0];
    expect(route11.parent).to.be.eq(cat1);
    expect(route11.level).to.be.eq(3);
    expect(route11.features.length).to.be.eq(2);
    expect(route11.folders.length).to.be.eq(2);

    const subroute = route11.folders[0];
    expect(subroute.parent).to.be.eq(route11);
    expect(subroute.level).to.be.eq(4);
    expect(subroute.features.length).to.be.eq(2);
    expect(subroute.folders.length).to.be.eq(0);

    const stats = getImportedFolderStats(root);
    expect(stats.mixed.length).to.be.eq(1);
  });
  it('only features', async () => {
    const fileName = 'only-features.kml';
    const kml: string = fs.readFileSync(path.join(__dirname, '..', '..', 'data', fileName), 'utf-8');
    const root: ImportedFolder = await parseKMLString({name: fileName} as File, kml, map2styles);

    expect(root.parent, 'root\'s parent must be null').to.be.null;
    expect(root.folders.length, 'there must be only one document imported').to.be.eq(0);
    expect(root.features.length).to.be.eq(5);
    const stats = getImportedFolderStats(root);
    expect(stats.routes).to.be.eq(1);
  });
  it('color of 5 length', () => {
    const ci = '12345';
    const co = nc(ci);
    expect(co).to.be.eq('#12345fff');
  });
  it('color of 6 length', () => {
    const ci = '123456';
    const co = nc(ci);
    expect(co).to.be.eq('#123456ff');
  });
  it('color of 8 length', () => {
    const ci = 'ab123456';
    const co = nc(ci);
    expect(co).to.be.eq('#123456ab');
  });
  it('color of 9 length', () => {
    const ci = 'ab123456x';
    const co = nc(ci);
    expect(co).to.be.eq('#123456ab');
  });
});
