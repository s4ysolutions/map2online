import {Circle as CircleStyle, Fill, Icon as IconStyle, Stroke, Style, Text} from 'ol/style';

import {Color, rgb} from 'lib/colors';
import {pinSvg} from '../../Svg/Pin';
import {FeatureType} from '../../../../app-rx/ui/tools';

//const SVG_HEIGHT = 960;
const SVG_HEIGHT = 512;
const ICON_HEIGHT = 30;
const SCALE = ICON_HEIGHT / SVG_HEIGHT;
const CENTER = 0.5;
const HEIGHT = 1;

const createText = (text: string) =>
  new Text({
    text
  });

const createStyle = (featureType: FeatureType, featureColor: Color, label?: string) => {
  const color = rgb[featureColor];
  return new Style({
    stroke: new Stroke({
      color: color,
      width: 2
    }),
    image:
      featureType === FeatureType.Point
        ? new IconStyle({
          // opacity: 0.8,
          scale: SCALE,
          anchor: [
            CENTER,
            HEIGHT
          ],
          src: pinSvg(color)
        })
        : new CircleStyle({
          radius: 7,
          stroke: new Stroke({
            color: '#ffffff',
            width: 2
          }),
          fill: new Fill({
            color: `${color}a0`
          })
        }),
    //text: createText(label),
    text: label ? createText(label) : undefined
  })
};

export const getStyle = (featureType: FeatureType, color: Color, label?: string) => {
  return createStyle(featureType, color, label);
};
