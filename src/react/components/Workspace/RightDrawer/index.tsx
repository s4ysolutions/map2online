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

import ExportMenu from '../../ExportMenu';
import MapSourcesMenu from '../../MapSourcesMenu';
import React from 'react';
import log from '../../../../log';
import {motion} from 'framer-motion';
import {getWorkspace} from '../../../../di-default';
import useObservable from '../../../hooks/useObservable';
import SettingsMenu from '../../SettingsMenu';
import './style.scss';

const variantMenu = {
  hide: {
    width: 0,
  },
  show: {
    width: 'auto',
  },
};

const workspace = getWorkspace();

const transition = { easy: 'tween', stiffness: 100 };

const RightDrawer: React.FunctionComponent = (): React.ReactElement => {
  const stateExport = useObservable(workspace.exportObservable(), workspace.exportOpen);
  const stateSources = useObservable(workspace.sourcesObservable(), workspace.sourcesOpen);
  const stateSettings = useObservable(workspace.settingsObservable(), workspace.settingsOpen);
  log.render(`RightDrawer exportMenu=${stateExport} sourceMenu=${stateSources} settings=${stateSettings}`);
  return <motion.div
    animate={stateExport || stateSources || stateSettings ? 'show' : 'hide'}
    className="right-drawer"
    initial={stateExport || stateSources || stateSettings ? 'show' : 'hide'}
    transition={transition}
    variants={variantMenu}
  >
    {stateSources ? <MapSourcesMenu /> : null}

    {stateExport ? <ExportMenu /> : null}

    {stateSettings ? <SettingsMenu /> : null}
  </motion.div >;
};

export default RightDrawer;

