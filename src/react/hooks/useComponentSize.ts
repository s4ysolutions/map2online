import * as React from 'react';
import {POS_NA} from 'lib/na';

interface HW {
  height: number;
  width: number;
}

const getSize = (el?: Element | null): HW => {
  if (el)
    return {
      height: el.clientHeight,
      width: el.clientWidth,
    };

  return {
    height: POS_NA,
    width: POS_NA,
  };
};

const useComponentSize = (ref: React.MutableRefObject<any>): HW => {
  let [componentSize, setComponentSize] = React.useState(
    getSize(ref ? ref.current : null)
  );
  const handleResize = React.useCallback(
    (): void => {
      console.log('dbg handleResize', ref);
      if (ref.current) {
        setComponentSize(getSize(ref.current));
      }
    },
    [ref]
  );

  React.useLayoutEffect(
    (): void | (() => void | undefined) => {
      if (!ref.current) {
        return;
      }

      handleResize();
      window.addEventListener('resize', handleResize);

      // eslint-disable-next-line consistent-return
      return (): void => {
        window.removeEventListener('resize', handleResize);
      };
    },
    [ref]
  );

  return componentSize;
};

export default useComponentSize;