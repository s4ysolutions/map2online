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

import * as React from 'react';
import FeatureSelect from './FeatureSelect';
import Line from 'react/components/Svg/Line';
import Pin from 'react/components/Svg/Pin';
import Tab from './Tab';
import {getMap2Styles, getTools} from '../../../di-default';
import useObservable from '../../hooks/useObservable';
import log from '../../../log';
import {SelectedTool} from '../../../ui/tools';

const tools = getTools();
const map2styles = getMap2Styles();

const ToolsPanel: React.FunctionComponent = (): React.ReactElement => {
  const toolState = useObservable(tools.selectedToolObservable(), tools.selectedTool);
  log.render('ToolsPanel', {toolState});
  return <div className="tools" >
    <div className="tabs" >
      <Tab
        on={toolState === SelectedTool.Point}
        onClick={tools.selectPoint}
      >
        <Pin color="white" />
      </Tab >
      <Tab
        on={toolState === SelectedTool.Line}
        onClick={tools.selectLine}
      >
        <Line color="white" />
      </Tab >
    </div >
    <div className="buttons" >
      <div className="row" >
        <FeatureSelect style={map2styles.styles[0]} />
        <FeatureSelect style={map2styles.styles[1]} />
        <FeatureSelect style={map2styles.styles[2]} />
      </div >
      <div className="row" >
        <FeatureSelect style={map2styles.styles[3]} />
        <FeatureSelect style={map2styles.styles[4]} />
        <FeatureSelect style={map2styles.styles[5]} />
      </div >
      <div className="row" >
        <FeatureSelect style={map2styles.styles[6]} />
        <FeatureSelect style={map2styles.styles[7]} />
        <FeatureSelect style={map2styles.styles[8]} />
      </div >
    </div >
  </div >;
};

export default ToolsPanel;
