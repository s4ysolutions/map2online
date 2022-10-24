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

import * as React from 'react';
import Line from 'react/components/Svg/Line';
import Pin from 'react/components/Svg/Pin';
import {getMap2Styles, getTools} from '../../../di-default';
import useObservable from '../../hooks/useObservable';
import {SelectedTool} from '../../../ui/tools';
import log from '../../../log';
import {Style} from '../../../style';

const tools = getTools();
const map2styles = getMap2Styles();
const defaultStyles = map2styles.defaultStyle;

interface Props {
  style: Style;
}

const FeatureSelect: React.FunctionComponent<Props> = ({style}): React.ReactElement => {
  const tool = useObservable(tools.selectedToolObservable(), tools.selectedTool);
  const lineStyle = useObservable(tools.lineStyleObservable(), tools.lineStyle);
  const pointStyle = useObservable(tools.pointStyleObservable(), tools.pointStyle);
  const on = tool === SelectedTool.Line && lineStyle.id === style.id || tool === SelectedTool.Point && pointStyle.id === style.id;
  log.render(`FeatureSelect style=${style.id} selected=${on}`);
  return <div
    className={`select ${on ? 'on' : 'off'}`}
    onClick={(): void => tools.selectStyle(style)}
  >
    {tool === SelectedTool.Point
      ? <Pin color={style.iconStyle?.color || defaultStyles.iconStyle.color} />
      : <Line color={style.lineStyle?.color || defaultStyles.lineStyle.color} />}
  </div >;
};

export default React.memo(FeatureSelect);
