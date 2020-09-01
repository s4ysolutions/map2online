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
import {getWording, getWorkspace} from '../../../../di-default';
import useObservable from '../../../hooks/useObservable';
import log from '../../../../log';
import MenuButton from './MenuButton';
import FolderOpen from '../../Svg/FolderOpen';
import FolderClose from '../../Svg/FolderClose';

const workspace = getWorkspace();
const wording = getWording();

const CatalogButton = (): React.ReactElement => {
  log.render('AppButton');
  const show = useObservable(workspace.catalogObservable(), workspace.catalogOpen);
  return <MenuButton onClick={workspace.toggleCatalog} title={wording.C('Catalog')} >
    {show ? <FolderOpen /> : <FolderClose />}
  </MenuButton >;
};

export default CatalogButton;
