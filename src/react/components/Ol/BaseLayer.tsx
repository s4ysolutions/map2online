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

import React, {useEffect} from 'react';
import Map from 'ol/Map';
import useMapDefinition from './hooks/useMapDefinition';
import getSource from './lib/getSource';
import getLayer from './lib/getLayer';

const BaseLayer: React.FunctionComponent<{map: Map}> = ({map}): null => {
  const mapDefinition = useMapDefinition();
  const source = getSource(mapDefinition); // null if Google
  const layer = source === null ? null : getLayer(source);

  useEffect(() => {
    const layers = map.getLayers();
    if (layer) {
      if (layers.getLength() === 0) {
        map.addLayer(layer);
      } else {
        layers.setAt(0, layer);
      }
    } else if (layers.getLength() > 0) {
      // hide base level if google
      layers.item(0).setVisible(false);
    }
  }, [layer, map]);

  return null;
};

export default BaseLayer;

