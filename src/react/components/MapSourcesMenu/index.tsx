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
import MapSourceItem from './MapSourceItem';
import MenuCollapsableItem from '../Menu/MenuCollapsableItem';
import T from 'l10n';
import log from '../../../log';
import mapGroups, {MapGroupDefinition} from '../../../map-sources/definitions';

const MapSourcesMenu: React.FunctionComponent = (): React.ReactElement => {
  log.render('MapSourceMenu');
  return <React.Fragment >
    {mapGroups.map((group: MapGroupDefinition): React.ReactElement =>
      <MenuCollapsableItem
        id={group.id}
        key={group.id} >
        <div className="title" >
          {T`${group.id}`}
        </div >
        <div className="sub-items" >
          {group.maps.map((map): React.ReactElement => <MapSourceItem key={map.id} source={map} />)}
        </div >
      </MenuCollapsableItem >)}
  </React.Fragment >;
};

export default MapSourcesMenu;


