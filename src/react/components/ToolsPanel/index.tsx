import * as React from 'react';
import {Color} from 'app-rx/colors';
import FeatureSelect from './FeatureSelect';
import Line from 'react/components/Svg/Line';
import Pin from 'react/components/Svg/Pin';
import Tab from './Tab';
import {getTools} from '../../../di-default';
import useObservable from '../../hooks/useObservable';
import log from '../../../log';
import {Tool} from '../../../app-rx/ui/tools';

const tools = getTools();

const ToolsPanel: React.FunctionComponent = (): React.ReactElement => {
  const toolState = useObservable(tools.toolObservable(), tools.tool);
  log.render('Render ToolsPanel');
  return <div className="tools" >
    <div className="tabs" >
      <Tab
        on={toolState === Tool.Point}
        onClick={tools.selectPoint}
      >
        <Pin color="white" />
      </Tab >
      <Tab
        on={toolState === Tool.Line}
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