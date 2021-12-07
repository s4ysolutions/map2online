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
import T from 'l10n';
import log from '../../../log';
import MenuItem from '../Menu/MenuItem';
import {getWorkspace} from '../../../di-default';

const workspace = getWorkspace();

const SettingsMenu: React.FunctionComponent = (): React.ReactElement => {
  log.render('SettingsMenu');
  return <React.Fragment >
    <MenuItem onClick={workspace.toggleTools} >
      <div className="title" >
        {T`Tools`}
      </div >
    </MenuItem >

    <MenuItem onClick={workspace.togglePersonalization} >
      <div className="title" >
        {T`Personalization`}
      </div >
    </MenuItem >
  </React.Fragment >;
};

export default SettingsMenu;
