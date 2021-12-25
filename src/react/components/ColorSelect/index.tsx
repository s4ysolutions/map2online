/*
 * Copyright 2021 s4y.solutions
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

import * as React from 'react';
import {getMap2Styles} from '../../../di-default';
import {Style} from '../../../style';
import Pin from '../Svg/Pin';
import Line from '../Svg/Line';
import './style.scss';
import log from '../../../log';

const map2styles = getMap2Styles().styles;

// onClick={() => handleColorSelect(style)}
// eslint-disable-next-line no-unused-vars
const ColorSelect: React.FunctionComponent<{ isPoint: boolean, selected: Style, onColorSelect: (style: Style) => void }> = ({
  isPoint,
  onColorSelect: handleColorSelect,
  selected,
}): React.ReactElement => {
  log.render('ColorSelect', {selected});
  return <div className="color-selector-view" >
    {map2styles.map((style: Style) => <div
      className={`color-selector-button ${selected.id === style.id ? 'selected' : ''}`}
      key={style.id}
      onClick={() => handleColorSelect(style)}
    >
      {isPoint ? <Pin color={style.iconStyle.color} /> : <Line color={style.lineStyle.color} />}
    </div >)}
  </div >;
};

export default ColorSelect;
