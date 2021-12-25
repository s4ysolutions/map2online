/* eslint-disable */
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
import fs from 'fs';
import path from 'path';
import {ImportedFolder} from '../../../src/importer';
import {parseKMLString} from '../../../src/importer/default/kml-parser';
import {expect} from 'chai';
import {map2StylesFactory} from '../../../src/style/default/styles';
import {fileURLToPath} from 'url';
import { dirname } from 'path';
import log from '../../../src/log';

log.disableDebug();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const map2styles = map2StylesFactory();

describe('KML Import problems', () => {
  it('problem with BR tag inside description', async () => {
    const fileName = 'problem-br-tag.kml';
    const kml: string = fs.readFileSync(path.join(__dirname, '..', '..', 'data', fileName), 'utf-8');
    const root: ImportedFolder = await parseKMLString({name: fileName} as File, kml, map2styles);

    expect(root.parent, 'root\'s parent must be null').to.be.null;
    expect(root.level).to.be.eq(0, 'root\'s level number must be 0');
    expect(fileName).to.be.eq(root.name, 'root node must be named by the file name');
  });
});
