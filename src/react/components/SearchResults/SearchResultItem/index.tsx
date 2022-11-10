/*
 * Copyright 2022 s4y.solutions
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react';
import {SearchResponse} from '../../../../search';
import log from '../../../../log';
import ColorSelector from './ColorSelector';
import ShowOnMap from '../../Svg/LocationCrosshairs';
import AddToRoute from '../../Svg/CirclePlus';
import {map2colors} from '../../../../style/colors';
import './styles.scss';
import {getBaseLayer} from '../../../../di-default';

const baseLayer = getBaseLayer();

const SearchResultItem: React.FunctionComponent<{
  searchResponse: SearchResponse,
  onMoveMapTo: (lon: number, lat: number) => void
}> = ({searchResponse, onMoveMapTo: handleMoveMapTo}): React.ReactElement => {
  log.render('SearchResult', searchResponse);

  const handleShowOnMapClick = () => {
    const control = baseLayer.centerControl;
    if (control) {}
    handleMoveMapTo(searchResponse.lon, searchResponse.lat);
  };

  return <div className="item" >
    <div >
      {searchResponse.id}
      &nbsp;
      {searchResponse.type}
      &nbsp;
      {searchResponse.geojson.type}
    </div >

    <div >
      {searchResponse.display_name}
    </div >

    <div >
      {JSON.stringify(searchResponse.address)}
    </div >

    <div className="controls" >

      {baseLayer.centerControl ? <div className="button" onClick={handleShowOnMapClick} >
        <ShowOnMap />
      </div > : null }

      <div className="button" >
        <AddToRoute />
      </div >

      <div className="space" />

      {Object.entries(map2colors).map(([id, color]) =>
        <ColorSelector color={color} key={id} searchResponse={searchResponse} />)}
    </div >
  </div >;
};

export default SearchResultItem;
