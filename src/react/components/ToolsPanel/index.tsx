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
import {Color} from '../../../lib/colors';
import FeatureSelect from './FeatureSelect';
import Line from 'react/components/Svg/Line';
import Pin from 'react/components/Svg/Pin';
import Tab from './Tab';
import {getTools} from '../../../di-default';
import useObservable from '../../hooks/useObservable';
import log from '../../../log';
import {FeatureType} from '../../../ui/tools';

const tools = getTools();

const ToolsPanel: React.FunctionComponent = (): React.ReactElement => {
  const toolState = useObservable(tools.featureTypeObservable(), tools.featureType);
  log.render('ToolsPanel', {toolState});
  return <div className="tools" >
    <div className="tabs" >
      <Tab
        on={toolState === FeatureType.Point}
        onClick={tools.selectPoint}
      >
        <Pin color="white" />
      </Tab >
      <Tab
        on={toolState === FeatureType.Line}
        onClick={tools.selectLine}
      >
        <Line color="white" />
      </Tab >
    </div >
    <div className="buttons" >
      <div className="row" >
        <FeatureSelect color={Color.RED} />
        <FeatureSelect color={Color.MAGENTA} />
        <FeatureSelect color={Color.ORANGE} />
      </div >
      <div className="row" >
        <FeatureSelect color={Color.GREEN} />
        <FeatureSelect color={Color.BLUE} />
        <FeatureSelect color={Color.PINK} />
      </div >
      <div className="row" >
        <FeatureSelect color={Color.OLIVE} />
        <FeatureSelect color={Color.CYAN} />
        <FeatureSelect color={Color.YELLOW} />
      </div >
    </div >
  </div >;
};

export default ToolsPanel;
