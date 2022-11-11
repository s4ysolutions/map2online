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

import React from 'react';
import Map from './Map';
import BaseLayer from './layers/BaseLayer';
import ActiveFeaturesLayer from './layers/ActiveFeaturesLayer';
import DrawInteraction from './interactions/DrawInteraction';
import ModifyInteraction from './interactions/ModifyInteraction';
import ContextMenuInteraction from './interactions/ContextMenuInteraction';
import './styles.scss';
import SearchResultsLayer from './layers/SearchResultsLayer';
import ZoomToFeaturesControl from './controls/ZoomToFeaturesControl';
import MyGPSLocationControl from './controls/MyGPSLocationControl';
import SearchControl from './controls/SearchControl';

const controls = [new ZoomToFeaturesControl(), new SearchControl()];

if (navigator.geolocation) {
  controls.push(new MyGPSLocationControl());
}

const OpenLayers: React.FunctionComponent = (): React.ReactElement => <Map controls={controls}>
  <BaseLayer />

  <ActiveFeaturesLayer >

    <ModifyInteraction />

  </ActiveFeaturesLayer>

  <DrawInteraction />

  <ContextMenuInteraction hitTolerance={5} />

  <SearchResultsLayer />

</Map>;

export default React.memo(OpenLayers);
