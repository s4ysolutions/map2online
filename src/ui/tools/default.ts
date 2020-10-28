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

import {FeatureType, Tools} from './index';
import {KV} from '../../kv-rx';
import {Map2Styles, Style} from '../../style';
import {map} from 'rxjs/operators';

const toolsFactory = (persistStorage: KV, styles: Map2Styles): Tools => {
  const byC = (color: string): Style => styles.byColor(color) || styles.defaultStyle;

  const th: Tools = {
    lineStyle: byC(persistStorage.get('tsl', styles.defaultStyle.lineStyle.color)),
    lineStyleObservable: () => persistStorage.observable('tsl')
      .pipe(map(byC)),
    pointStyle: byC(persistStorage.get('tsp', styles.defaultStyle.iconStyle.color)),
    pointStyleObservable: () => persistStorage.observable('tsp')
      .pipe(map(byC)),
    isLine: persistStorage.get<FeatureType.Point | FeatureType.Line>('tt', FeatureType.Point) === FeatureType.Line,
    isLineObservable: () => persistStorage.observable('tt'),
    isPoint: persistStorage.get('tt', FeatureType.Point) === FeatureType.Point,
    isPointObservable: () => persistStorage.observable('tt'),
    selectStyle (style: Style) {
      if (this.isLine) {
        persistStorage.set('tsl', style);
        this.colorLine = style;
      } else {
        persistStorage.set('tcp', style);
        this.colorPoint = style;
      }
    },
    selectLine () {
      persistStorage.set('tt', FeatureType.Line);
      this.tool = FeatureType.Line;
      this.isLine = true;
      this.isPoint = false;
    },
    selectPoint () {
      persistStorage.set('tt', FeatureType.Point);
      this.featureType = FeatureType.Point;
      this.isLine = false;
      this.isPoint = true;
    },
    featureType: persistStorage.get('tt', FeatureType.Point),
    featureTypeObservable: () => persistStorage.observable('tt'),
  };
  th.selectStyle = th.selectStyle.bind(th);
  th.selectLine = th.selectLine.bind(th);
  th.selectPoint = th.selectPoint.bind(th);
  return th;
};

export default toolsFactory;
