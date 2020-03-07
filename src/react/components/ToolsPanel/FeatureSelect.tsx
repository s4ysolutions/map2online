import * as React from 'react';
import {Color, rgb} from 'app-rx/colors';
import Line from 'react/components/Svg/Line';
import Pin from 'react/components/Svg/Pin';
import {getTools} from '../../../di-default';
import useObservable from '../../hooks/useObservable';
import {Tool} from '../../../app-rx/ui/tools';

const tools = getTools();

interface Props {
  color: Color;
}

const FeatureSelect: React.FunctionComponent<Props> = ({color}): React.ReactElement => {
  const tool = useObservable(tools.toolObservable(), tools.tool);
  const lineColor = useObservable(tools.colorLineObservable(), tools.colorLine);
  const pointColor = useObservable(tools.colorPointObservable(), tools.colorPoint);
  const on = tool === Tool.Line && lineColor === color || tool === Tool.Point && pointColor === color;
  console.debug(`Render FeatureSelect color=${color} selected=${on}`);
  return <div
    className={`select ${on ? 'on' : 'off'}`}
    onClick={(): void => tools.selectColor(color)}
  >
    {tool === Tool.Point ? <Pin color={rgb[color]} /> : <Line color={rgb[color]} />}
  </div >;
};

export default React.memo(FeatureSelect);
