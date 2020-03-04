import {POS_NA} from 'lib/na';
import usePersistState from '../../../hooks/usePersistState';
import {getLocalStorage} from '../../../../di-default';

const initialState = {
  stickBottom: true,
  stickRight: true,
  x: POS_NA,
  y: POS_NA,
};

const DEFAULT_X = 0;
const DEFAULT_Y = -48;

const localStorage = getLocalStorage();

const usePosition = (
  width: number,
  height: number,
  parentWidth: number,
  parentHeight: number
): [{ x: number; y: number }, (x: number, y: number) => void] => {
  const w = parentWidth - width;
  const h = parentHeight - height;
  const xy = {
    x: DEFAULT_X,
    y: DEFAULT_Y,
  };

  const positionState = usePersistState('fp', initialState);
  const setPosition = (xx: number, yy: number): void => {
    const x = -xx;
    const y = -yy;

    const stickRight = positionState.stickRight ? x < w : x <= 0;
    const stickBottom = positionState.stickBottom ? y < h : y <= 0;

    return localStorage.set('fp', {
      stickBottom,
      stickRight,
      x: stickRight ? (x < 0 ? 0 : x) : x >= w ? 0 : w - x,
      y: stickBottom ? (y < 0 ? 0 : y) : y >= h ? 0 : h - y,
    });
  };
  if (
    width <= 0 ||
    height <= 0 ||
    parentWidth <= 0 ||
    parentHeight <= 0 ||
    positionState.x === POS_NA ||
    positionState.y === POS_NA
  ) {
    return [xy, setPosition];
  }

  // noinspection DuplicatedCode
  if (positionState.stickRight) {
    xy.x = -(positionState.x > w ? w : positionState.x < 0 ? 0 : positionState.x);
  } else {
    xy.x = positionState.x > w ? 0 : positionState.x < 0 ? -w : positionState.x - w;
  }

  // noinspection DuplicatedCode
  if (positionState.stickBottom) {
    xy.y = -(positionState.y > h ? h : positionState.y < 0 ? 0 : positionState.y);
  } else {
    xy.y = positionState.y > h ? 0 : positionState.y < 0 ? -h : positionState.y - h;
  }
  return [xy, setPosition];
};

export default usePosition;