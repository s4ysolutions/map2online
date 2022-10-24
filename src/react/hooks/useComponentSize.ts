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
import {POS_NA} from 'lib/na';

interface HW {
  height: number;
  width: number;
}

const getSize = (el?: Element | null): HW => {
  if (el) {
    return {
      height: el.clientHeight,
      width: el.clientWidth,
    };
  }

  return {
    height: POS_NA,
    width: POS_NA,
  };
};

const useComponentSize = (el: HTMLDivElement | null): HW => {
  const [componentSize, setComponentSize] = React.useState(getSize(el));
  const handleResize = React.useCallback(
    (): void => {
      if (el) {
        setComponentSize(getSize(el));
      }
    },
    [el],
  );

  React.useLayoutEffect(
    (): void | (() => void | undefined) => {
      if (!el) {
        return;
      }

      handleResize();
      window.addEventListener('resize', handleResize);

      // eslint-disable-next-line consistent-return
      return (): void => {
        window.removeEventListener('resize', handleResize);
      };
    },
    [el, handleResize],
  );

  return componentSize;
};

export default useComponentSize;
