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

/* eslint-disable react/forbid-component-props */
import React, {useEffect} from 'react';
import {motion} from 'framer-motion';
// import {tween} from 'popmotion';
import log from '../../../../log';
import useObservable from '../../../hooks/useObservable';
import {getWorkspace} from '../../../../di-default';
import Catalog from '../../Catalog';

const variantSmall = {
  hide: {
    // transition: tween,
    width: 0,
  },
  show: {
    // transition: tween,
    width: '100%',
  },
};

const variantMid = {
  hide: {
    // transition: tween,
    width: 0,
  },
  show: {
    // transition: tween,
    width: '75%',
  },
};

const variantBig = {
  hide: {
    // transition: tween,
    width: 0,
  },
  show: {
    // transition: tween,
    width: '50%',
  },
};

const OL_ZOOM_OFFSET_PX = 8;

const onValueChange = {
  width: (): boolean => {
    const cc = document.getElementsByClassName('left-drawer');
    if (cc.length < 1) {
      return false;
    }
    /*
     *for (const zc of [document.getElementsByClassName('ol-zoom'), document.getElementsByClassName('ol-zoom-extent')]) {
     *  if (zc.length < 1) {
     *    return false;
     *  }
     *  // see src/styles.scss
     *  zc[0].setAttribute('style', `left: ${cc[0].clientWidth + OL_ZOOM_OFFSET_PX}px`);
     *}
     */
    return false;
  },
};

const SMALL = 512;
const MID = 1024;

const workspace = getWorkspace();
// const transition = { type: 'tween', stiffness: 50 };
const transition = { easy: 'tween', stiffness: 100 };

const LeftDrawer: React.FunctionComponent = (): React.ReactElement => {
  const width = document.body.clientWidth;
  useEffect((): void => {
    onValueChange.width();
  }, []);
  const stateCatalog = useObservable(workspace.catalogObservable(), workspace.catalogOpen);
  log.render(`LeftDrawer catalog=${stateCatalog} width=${width}`);
  // onValueChange={onValueChange}
  return <motion.div
    animate={stateCatalog ? 'show' : 'hide'}
    className="left-drawer"
    initial={stateCatalog ? 'show' : 'hide'}
    transition={transition}
    variants={width < SMALL ? variantSmall : (width < MID ? variantMid : variantBig)} >
    <Catalog />
  </motion.div >;
};

export default LeftDrawer;
