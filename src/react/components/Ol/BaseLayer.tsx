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
