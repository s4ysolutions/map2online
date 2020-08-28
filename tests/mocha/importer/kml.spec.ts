/* eslint-disable prefer-destructuring,no-unused-expressions,no-magic-numbers,camelcase */
import fs from 'fs';
import path from 'path';
import {expect} from 'chai';
import {parseKMLString} from '../../../src/importer/default/kml-parser';
import {ImportedFolder} from '../../../src/importer';
import {Point} from '../../../src/app-rx/catalog';
import {getImportedFolderStats} from '../../../src/importer/stats';

describe('KML Importer', () => {
  it('rrb-like simple correct file', async () => {
    const fileName = 'simple.kml';
    const kml: string = fs.readFileSync(path.join(__dirname, '..', '..', 'data', fileName), 'utf-8');
    const root: ImportedFolder = await parseKMLString({name: fileName} as File, kml);

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
    expect(route11.description).to.be.eq('Desc r11');
    expect(route11.folders.length).to.be.eq(0);
    expect(route11.features.length).to.be.eq(2);
    expect(route11.features[0].title).to.be.eq('111');
    expect(route11.features[1].title).to.be.eq('112');
    expect(route11.features[0].description).to.be.eq('Desc 111');
    expect(route11.features[1].description).to.be.eq('Desc 112');
    const route12 = cat1.folders[1];
    expect(route12.parent).to.be.eq(cat1);
    expect(route12.level).to.be.eq(3);
    expect(route12.folders.length).to.be.eq(0);
    // expect(2).to.be.eq(route12.features.length, '2nd route must have 2 features');
    expect(route12.features.length, '2nd route must have 3 features').to.be.eq(3);
    expect(route12.name).to.be.eq('Route 12');
    expect(route12.description).to.be.eq('Desc r12');
    expect(route12.features[0].id).to.be.not.null;
    expect(route12.features[0].title).to.be.eq('121');
    expect(route12.features[0].description).to.be.eq('Desc 121');
    expect(route12.features[1].id).to.be.not.null;
    expect(route12.features[1].title).to.be.eq('122');
    expect(route12.features[1].description).to.be.eq('Desc 122');
    expect(route12.features[2].id, 'Absent id must be filled in anyway').to.be.not.null;
    expect(route12.features[2].title).to.be.eq('123');
    expect(route12.features[2].description, 'Absent feature description must be empty string').to.be.eq('');
  });
  it('real rrb file', async () => {
    const fileName = 'rrb.kml';
    const kml: string = fs.readFileSync(path.join(__dirname, '..', '..', 'data', fileName), 'utf-8');
    const root: ImportedFolder = await parseKMLString({name: fileName} as File, kml);

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
    const root: ImportedFolder = await parseKMLString({name: fileName} as File, kml);

    expect(root.parent, 'root\'s parent must be null').to.be.null;
    expect(root.folders.length, 'there must not be any category imported').to.be.eq(0);
    expect(root.features.length, 'there must be 5 features in the root folder').to.be.eq(5);
  });
  it('3 levels file with mixed features and folders', async () => {
    const fileName = '3-levels-mixed.kml';
    const kml: string = fs.readFileSync(path.join(__dirname, '..', '..', 'data', fileName), 'utf-8');
    const root: ImportedFolder = await parseKMLString({name: fileName} as File, kml);

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
  });
  it('only features', async () => {
    const fileName = 'only-features.kml';
    const kml: string = fs.readFileSync(path.join(__dirname, '..', '..', 'data', fileName), 'utf-8');
    const root: ImportedFolder = await parseKMLString({name: fileName} as File, kml);

    expect(root.parent, 'root\'s parent must be null').to.be.null;
    expect(root.folders.length, 'there must be only one document imported').to.be.eq(0);
    expect(root.features.length).to.be.eq(5);
    const stats = getImportedFolderStats(root);
    expect(stats.routes).to.be.eq(1);
  });
});
