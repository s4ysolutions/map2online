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
import useObservable from '../../hooks/useObservable';
import mapContext from './context/map';
import log from '../../../log';
import {getBaseLayer} from '../../../di-default';
import {sourceNameToMapId} from './lib/mapid';

const baseLayer = getBaseLayer();

const BaseLayer: React.FunctionComponent = (): React.ReactElement => {
  const baseLayerName = useObservable(baseLayer.sourceNameObservable(), baseLayer.sourceName);
  log.render(`GoogleBaseLayer sourceName=${baseLayerName}`);

  const map = React.useContext(mapContext);
  if (map) {
    const mapTypeId = sourceNameToMapId(baseLayerName);
    if (map.getMapTypeId() === mapTypeId) {
      log.debug('GoogleBaseLayer identical');
    } else {
      log.debug(`GoogleBaseLayer setMapTypeId=${mapTypeId}`);
      map.setMapTypeId(mapTypeId);
    }
  }
  return null;
};

export default React.memo(BaseLayer);
