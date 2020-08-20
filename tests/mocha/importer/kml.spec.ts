import fs from 'fs';
import path from 'path';
import {expect} from 'chai';
import {parseKMLString} from '../../../src/importer/default/kml-parser';
import {ImportedFolder} from '../../../src/importer';

describe('KML Importer', () => {
  let simple: string;
  before(() => {
    simple = fs.readFileSync(path.join(__dirname, '..', '..', 'data', 'simple.kml'), "utf-8")
  });
  it('rrb-like proper formatted', async () => {
    const folders = await parseKMLString(null, simple);
    expect(folders.length).to.be.eq(1);
    const root = folders[0];
    expect(root.parent).to.be.null;
    expect(root.level).to.be.eq(0);
    expect(root.name).to.be.eq('root');
    expect(root.folders.length).to.be.eq(1);
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
    expect(route12.features.length).to.be.eq(2);
    expect(route12.name).to.be.eq('Route 12');
    expect(route12.description).to.be.eq('Desc r12');
    expect(route12.features[0].title).to.be.eq('121');
    expect(route12.features[1].title).to.be.eq('122');
    expect(route12.features[0].description).to.be.eq('Desc 121');
    expect(route12.features[1].description).to.be.eq('Desc 122');
  });
});
