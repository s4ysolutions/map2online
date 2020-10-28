/* eslint-disable no-unused-expressions,prefer-destructuring */
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

import sax, {QualifiedAttribute, SAXParser} from 'sax';
import {expect} from 'chai';

describe('SAX attribute', () => {
  let parser: SAXParser;
  beforeEach(() => {
    parser = sax.parser(true, {normalize: true, trim: true, xmlns: true});
  });

  it('simple string', () => {
    let id: string | QualifiedAttribute = null;
    parser.onopentag = tag => {
      if (tag.name === 'el') {
        id = tag.attributes.id;
      }
    };
    parser.write('<root><el id="id1"></el></root>').close();
    expect(id).to.be.not.null;
    expect(id).to.have.property('name', 'id');
    expect(id).to.have.property('local', 'id');
    expect(id).to.have.property('value', 'id1');
    expect(id).to.have.property('prefix', '');
    expect(id).to.have.property('uri', '');
  });

  it('uri like string', () => {
    let id: string | QualifiedAttribute = null;
    parser.onopentag = tag => {
      if (tag.name === 'el') {
        id = tag.attributes.id;
      }
    };
    parser.write('<root><el id="http://id1.com"></el></root>').close();
    expect(id).to.be.not.null;
    expect(id).to.have.property('name', 'id');
    expect(id).to.have.property('local', 'id');
    expect(id).to.have.property('value', 'http://id1.com');
    expect(id).to.have.property('prefix', '');
    expect(id).to.have.property('uri', '');
  });
});
