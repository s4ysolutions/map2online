/* eslint-disable no-magic-numbers */
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
import {KV} from '../../../src/kv/sync';
import memoryStorageFactory, {MemoryStorage} from '../../mocks/kv/memoryStorage';
import {map2StylesFactory} from '../../../src/style/default/styles';
import {Map2Styles, Style} from '../../../src/style';
import {SelectedTool, Tools} from '../../../src/ui/tools';
import toolsFactory from '../../../src/ui/tools/default';
import {first} from 'rxjs/operators';

describe('Default map2 styles', () => {
  let memoryStorage: MemoryStorage;
  let storage: KV;
  let map2styles: Map2Styles;
  let map2DefaultStyle: Style;
  let map2TestStyle: Style;
  let tools: Tools;

  beforeEach(() => {
    memoryStorage = memoryStorageFactory();
    storage = memoryStorage;
    map2styles = map2StylesFactory();
    map2DefaultStyle = map2styles.defaultStyle;
    map2TestStyle = map2styles.styles[2];
    tools = toolsFactory(storage, map2styles);
  });

  it('default tools', () => {
    expect(tools.lineStyle.id).to.be.eq(map2DefaultStyle.id);
    expect(tools.pointStyle.id).to.be.eq(map2DefaultStyle.id);
    expect(tools.selectedTool).to.be.eq(SelectedTool.Point);
  });

  it('swith tools', () => {
    expect(tools.selectedTool).to.be.eq(SelectedTool.Point);
    tools.selectLine();
    expect(tools.selectedTool).to.be.eq(SelectedTool.Line);
    tools.selectPoint();
    expect(tools.selectedTool).to.be.eq(SelectedTool.Point);
    tools.selectLine();
    expect(tools.selectedTool).to.be.eq(SelectedTool.Line);
    tools.selectPoint();
    expect(tools.selectedTool).to.be.eq(SelectedTool.Point);
  });

  it('observable tools switch to line', async () => {
    expect(tools.selectedTool).to.be.eq(SelectedTool.Point);
    const promise = new Promise<SelectedTool>(rs => {
      tools.selectedToolObservable().pipe(first())
        .subscribe((selectedTool) => {
          expect(selectedTool).to.be.eq(SelectedTool.Line);
          expect(selectedTool).to.be.eq(SelectedTool.Line);
          rs(selectedTool);
        });
    });
    expect(tools.selectedTool).to.be.eq(SelectedTool.Point);
    tools.selectLine();
    await promise;
    expect(tools.selectedTool).to.be.eq(SelectedTool.Line);
  });

  it('observable tools switch to point', (done) => {
    expect(tools.selectedTool).to.be.eq(SelectedTool.Point);
    tools.selectLine();
    tools.selectedToolObservable().pipe(first())
      .subscribe((selectedTool) => {
        expect(selectedTool).to.be.eq(SelectedTool.Point);
        expect(selectedTool).to.be.eq(SelectedTool.Point);
        expect(tools.selectedTool).to.be.eq(SelectedTool.Point);
        done();
      });

    expect(tools.selectedTool).to.be.eq(SelectedTool.Line);
    tools.selectPoint();
  });

  it('switch point style', (done) => {
    tools.pointStyleObservable().pipe(first())
      .subscribe((style) => {
        expect(style.id).to.be.eq(map2TestStyle.id);
        expect(tools.selectedTool).to.be.eq(SelectedTool.Point);
        expect(memoryStorage.mem.tsp).to.be.eq(JSON.stringify(map2TestStyle.iconStyle!.color));
        expect(map2styles.byColorId(JSON.parse(memoryStorage.mem.tsp))!.id).to.be.eq(map2TestStyle.id);
        expect(tools.pointStyle.id).to.be.eq(map2TestStyle.id);
        expect(tools.lineStyle.id).to.be.eq(map2DefaultStyle.id);
        done();
      });

    expect(tools.selectedTool).to.be.eq(SelectedTool.Point);
    expect(tools.pointStyle.id).to.be.eq(map2DefaultStyle.id);
    expect(tools.lineStyle.id).to.be.eq(map2DefaultStyle.id);

    tools.selectStyle(map2TestStyle);
  });

  it('switch line style', (done) => {
    tools.selectLine();

    tools.lineStyleObservable().pipe(first())
      .subscribe((style) => {
        expect(style.id).to.be.eq(map2TestStyle.id);
        expect(tools.selectedTool).to.be.eq(SelectedTool.Line);
        expect(style.id).to.be.eq(map2TestStyle.id);
        expect(memoryStorage.mem.tsl).to.be.eq(JSON.stringify(map2TestStyle.lineStyle!.color));
        expect(map2styles.byColorId(JSON.parse(memoryStorage.mem.tsl))!.id).to.be.eq(map2TestStyle.id);
        expect(tools.pointStyle.id).to.be.eq(map2DefaultStyle.id);
        expect(tools.lineStyle.id).to.be.eq(map2TestStyle.id);
        done();
      });

    expect(tools.selectedTool).to.be.eq(SelectedTool.Line);
    expect(tools.pointStyle.id).to.be.eq(map2DefaultStyle.id);
    expect(tools.lineStyle.id).to.be.eq(map2DefaultStyle.id);

    tools.selectStyle(map2TestStyle);
  });

});
