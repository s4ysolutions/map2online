import * as React from 'react';
import {Color, rgb} from '../../../lib/colors';
import Line from 'react/components/Svg/Line';
import Pin from 'react/components/Svg/Pin';
import {getTools} from '../../../di-default';
import useObservable from '../../hooks/useObservable';
import {FeatureType} from '../../../app-rx/ui/tools';
import log from '../../../log';

const tools = getTools();

interface Props {
  color: Color;
}

const FeatureSelect: React.FunctionComponent<Props> = ({color}): React.ReactElement => {
  const tool = useObservable(tools.featureTypeObservable(), tools.featureType);
  const lineColor = useObservable(tools.colorLineObservable(), tools.colorLine);
  const pointColor = useObservable(tools.colorPointObservable(), tools.colorPoint);
  const on = tool === FeatureType.Line && lineColor === color || tool === FeatureType.Point && pointColor === color;
  log.render(`FeatureSelect color=${color} selected=${on}`);
  return <div
    className={`select ${on ? 'on' : 'off'}`}
    onClick={(): void => tools.selectColor(color)}
  >
    {tool === FeatureType.Point ? <Pin color={rgb[color]} /> : <Line color={rgb[color]} />}
  </div >;
};

export default React.memo(FeatureSelect);
