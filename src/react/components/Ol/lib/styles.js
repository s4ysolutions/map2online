import {Circle as CircleStyle, Fill, Icon as IconStyle, Stroke, Style} from 'ol/style';

import {pinSvg} from 'components/Svg/Pin';
import {rgb} from 'lib/colors';

//const SVG_HEIGHT = 960;
const SVG_HEIGHT = 512;
const ICON_HEIGHT = 30;
const SCALE = ICON_HEIGHT / SVG_HEIGHT;
const CENTER = 0.5;
const HEIGHT = 1;

const createStyle = (type, color) => new Style({
  stroke: new Stroke({
    color,
    width: 2
  }),
  image:
    type === 'Point'
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
      })
});

const styles = {};

export const getStyle = (type, color) => {
  const key = `${type}@${color}`;
  const style = styles[key];
  if (style) {
    return style;
  }
  styles[key] = createStyle(type, rgb[color]);
  return styles[key];
};
