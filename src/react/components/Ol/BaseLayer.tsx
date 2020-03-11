import * as React from 'react';
import Layer from 'ol/layer/Layer';
import TileLayer from 'ol/layer/Tile';
import log from '../../../log';
import {getMapDefinition} from '../../../map-sources/definitions';
import useObservable from '../../hooks/useObservable';
import {getBaseLayer} from '../../../di-default';
import mapContext from './context/map';

const baseLayer = getBaseLayer();

const BaseLayer: React.FunctionComponent = (): React.ReactElement => {
  const baseLayerName = useObservable(baseLayer.sourceNameObservable(), baseLayer.sourceName);
  const map = React.useContext(mapContext);

  log.render(`OlSource sourceName=${baseLayerName}`);
  const layerRef = React.useRef<Layer>(null);
  if (layerRef.current) {
    map.removeLayer(layerRef.current);
    layerRef.current = null;
  }
  const md = getMapDefinition(baseLayerName);
  if (md !== null && md.olSourceFactory) {
    layerRef.current = new TileLayer({source: md.olSourceFactory()});
    map.addLayer(layerRef.current);
  }
  return null;
};

export default React.memo(BaseLayer);
