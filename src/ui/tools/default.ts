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

import {SelectedTool, Tools} from './index';
import {KV} from '../../kv/sync';
import {Map2Styles, Style} from '../../style';
import {map} from 'rxjs/operators';

const toolsFactory = (persistStorage: KV, styles: Map2Styles): Tools => {
  const byC = (color: string): Style => styles.byColorId(color) || styles.defaultStyle;

  const th: Tools = {
    get lineStyle() {
      return byC(persistStorage.get('tsl', styles.defaultStyle.lineStyle.color));
    },
    lineStyleObservable: () => persistStorage.observable<string>('tsl')
      .pipe(map(byC)),
    get pointStyle() {
      return byC(persistStorage.get('tsp', styles.defaultStyle.iconStyle.color));
    },
    pointStyleObservable: () => persistStorage.observable<string>('tsp')
      .pipe(map(byC)),
    get isLine() {
      return persistStorage.get<SelectedTool.Point | SelectedTool.Line>('tt', SelectedTool.Point) === SelectedTool.Line;
    },
    isLineObservable: () => persistStorage.observable('tt'),
    get isPoint() {
      return persistStorage.get('tt', SelectedTool.Point) === SelectedTool.Point;
    },
    isPointObservable: () => persistStorage.observable('tt'),
    selectStyle(style: Style) {
      if (this.isLine) {
        if (style.lineStyle?.color) {
          persistStorage.set('tsl', style.lineStyle.color);
        }
      } else if (style.iconStyle?.color) {
        persistStorage.set('tsp', style.iconStyle.color);
      }
    },
    selectLine() {
      persistStorage.set('tt', SelectedTool.Line);
    },
    selectPoint() {
      persistStorage.set('tt', SelectedTool.Point);
    },
    get selectedTool():SelectedTool {
      return persistStorage.get<SelectedTool>('tt', SelectedTool.Point);
    },
    selectedToolObservable: () => persistStorage.observable('tt'),
  };
  th.selectStyle = th.selectStyle.bind(th);
  th.selectLine = th.selectLine.bind(th);
  th.selectPoint = th.selectPoint.bind(th);
  return th;
};

export default toolsFactory;
