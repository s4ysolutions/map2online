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
import {MapDefinition} from '../../../../map-sources/definitions';
import {getBaseLayer, getWorkspace} from '../../../../di-default';
import T from '../../../../l10n';
import MenuItem from '../../UIElements/Menu/MenuItem';

const baseLayer = getBaseLayer();
const workspace = getWorkspace();

interface Props {
  source: MapDefinition;
}

const MapSourceItem: React.FunctionComponent<Props> = ({source}): React.ReactElement => {

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    workspace.closeMenus();
    if (baseLayer.sourceName !== source.id) {
      baseLayer.sourceName = source.id;
    }
    event.stopPropagation();
    event.preventDefault();
  };

  return <MenuItem className={baseLayer.sourceName === source.id ? 'active' : ''} onClick={handleClick} title={T`${source.id}`} />;
};

export default MapSourceItem;
