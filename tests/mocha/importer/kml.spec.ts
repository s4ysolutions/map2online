/* eslint-disable prefer-destructuring,no-unused-expressions,no-magic-numbers */
import fs from 'fs';
import path from 'path';
import {expect} from 'chai';
import {parseKMLString} from '../../../src/importer/default/kml-parser';
import {ImportedFolder} from '../../../src/importer';

describe('KML Importer', () => {
  it.only('rrb-like simple correct file', async () => {
    const fileName = 'simple.kml';
    const kml: string = fs.readFileSync(path.join(__dirname, '..', '..', 'data', fileName), 'utf-8');
    const folders: ImportedFolder[] = await parseKMLString({name: fileName} as File, kml);

    expect(folders.length).to.be.eq(1, 'there must be exactly one root folder');

    const root = folders[0];
    expect(root.parent, 'root\'s parent must be null').to.be.null;
    expect(root.level).to.be.eq(0, 'root\'s level number must be 0');
    expect(fileName).to.be.eq(root.name, 'root node must be named by the file name');

    expect(folders.length, 'there must be only one category imported').to.be.eq(1);
    const cat1: ImportedFolder = root.folders[0];
    expect(cat1.parent).to.be.eq(root);
    expect(cat1.name).to.be.eq('Category 1');
    expect(cat1.folders.length).to.be.eq(2);

    expect(cat1.level).to.be.eq(1);
    const route11 = cat1.folders[0];
    expect(route11.parent).to.be.eq(cat1);
    expect(route11.level).to.be.eq(2);
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
    expect(route12.level).to.be.eq(2);
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
});
