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
import TileLayer from 'ol/layer/Tile';
import log from '../../../log';
import {getMapDefinition, isOlMapDefinition} from '../../../map-sources/definitions';
import useObservable from '../../hooks/useObservable';
import {getBaseLayer} from '../../../di-default';
import olMapContext from './context/map';
import TileSource from 'ol/source/Tile';

const baseLayer = getBaseLayer();
/*
 *getOlSource: function () {
 *  if (!this.sourceName) {
 *    return null;
 *  }
 *  const md = getMapDefinition(this.sourceName);
 *  if (!md) {
 *    return null;
 *  }
 *  if (!md.olSourceFactory) {
 *    return null;
 *  }
 *  return md.olSourceFactory();
 *},
 */
const BaseLayer: React.FunctionComponent = (): React.ReactElement => {
  const baseLayerName = useObservable(baseLayer.sourceNameObservable(), baseLayer.sourceName);
  const map = React.useContext(olMapContext);

  // const layerRef = React.useRef<Layer>(null);
  const md = getMapDefinition(baseLayerName);
  let layer = null;
  if (md !== null && isOlMapDefinition(md)) {
    // TODO: assuming TileSource
    layer = new TileLayer({source: md.olSourceFactory() as TileSource});
  }

  const layers = map.getLayers();
  log.render(`BaseLayer sourceName=${baseLayerName} layersLength=${layers.getLength()} layer is null=${!layer}`);
  if (layer) {
    if (layers.getLength() === 0) {
      map.addLayer(layer);
    } else {
      layers.setAt(0, layer);
    }
    //  layerRef.current = layer
  } else if (layers.getLength() > 0) {
    layers.item(0).setVisible(false);
  }
  return null;
};

export default React.memo(BaseLayer);
