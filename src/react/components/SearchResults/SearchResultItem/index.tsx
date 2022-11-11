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

import React, {useCallback} from 'react';
import {SearchResponse} from '../../../../search';
import log from '../../../../log';
import ColorSelector from './ColorSelector';
import ShowOnMap from '../../Svg/LocationCrosshairs';
import AddToRoute from '../../Svg/CirclePlus';
import {Map2Color, map2colors} from '../../../../style/colors';
import './styles.scss';
import {getBaseLayer, getCatalogUI, getMap2Styles, getSearchUI, getWorkspace} from '../../../../di-default';
import T from '../../../../l10n';
import {formatCoordinate} from '../../../../lib/format';
import useObservable from '../../../hooks/useObservable';
import {FeatureProps} from '../../../../catalog';
import {ID_NULL} from '../../../../lib/id';
import {RichText} from '../../../../richtext';

const baseLayer = getBaseLayer();
const catalogUI = getCatalogUI();
const map2Styles = getMap2Styles();
const searchUi = getSearchUI();
const workspace = getWorkspace();

const SearchResultItem: React.FunctionComponent<{
  searchResponse: SearchResponse,
  onMoveMapTo: (lon: number, lat: number) => void
}> = ({searchResponse, onMoveMapTo: handleMoveMapTo}): React.ReactElement => {
  log.render('SearchResult', searchResponse);

  const handleShowOnMapClick = () => {
    handleMoveMapTo(searchResponse.lon, searchResponse.lat);
  };

  const activeRoute = useObservable(catalogUI.activeRouteObservable(), catalogUI.activeRoute);

  const handleAddToRoute = useCallback(() => {
    if (activeRoute) {
      searchUi.isOnMap(searchResponse)
        .then(color => color || Map2Color.RED)
        .then(color => {
          const featureProps: FeatureProps = {
            style: map2Styles.byColorId(color) || map2Styles.defaultStyle,
            title: (searchResponse.display_name || ''),
            geometry: {coordinate: {lon: searchResponse.lon, lat: searchResponse.lat}},
            id: ID_NULL,
            summary: '',
            description: RichText.makeEmpty(),
            visible: true,
          };
          activeRoute.features.add(featureProps).then(feature => {
            catalogUI.showFeature(feature);
            if (!workspace.catalogOpen) {
              workspace.toggleCatalog();
            }
          });
        });
    }
  }, [activeRoute, searchResponse]);

  return <div className="item" >
    <div className="info" >
      <div className="display-name" >
        {searchResponse.display_name}
      </div >

      <div className="address" >
        {JSON.stringify(searchResponse.address)}
      </div >

      <div className="data" >
        <span className="coordinates" >
          {formatCoordinate(searchResponse)}
        </span >
        &nbsp;
        <span className="type" >
        (
          {T`${searchResponse.category}`}
          /

          {T`${searchResponse.type}`}
          )
        </span >

      </div >
    </div >

    <div className="controls" >

      {baseLayer.centerControl ? <div className="button" onClick={handleShowOnMapClick} >
        <ShowOnMap />
      </div > : null}

      {activeRoute
        ? <div className="button" onClick={handleAddToRoute} >
          <AddToRoute />
        </div > : null}

      <div className="space" />

      {Object.entries(map2colors).map(([id, color]) =>
        <ColorSelector color={color} key={id} searchResponse={searchResponse} />)}
    </div >

    <div className="license" >
      {searchResponse.licence}
    </div >
  </div >;
};

export default SearchResultItem;
