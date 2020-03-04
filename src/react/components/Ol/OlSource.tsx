import * as React from 'react';
import Layer from 'ol/layer/Layer';
import Map from 'ol/Map';
import TileLayer from 'ol/layer/Tile';
import log from '../../../log';
import {getMapDefinition} from '../../../map-sources/definitions';

interface Props {
  map: Map;
  source: string;
}

const OlSource: React.FunctionComponent<Props> = ({map, source}): React.ReactElement => {
  log.render(`OlSource sourceName=${source}`);
  const layerRef = React.useRef<Layer>(null);
  if (layerRef.current) {
    map.removeLayer(layerRef.current);
    layerRef.current = null;
  }
  const md = getMapDefinition(source);
  if (md !== null && md.olSourceFactory) {
    layerRef.current = new TileLayer({source: md.olSourceFactory()});
    map.addLayer(layerRef.current);
  }
  return null;
};

export default React.memo(OlSource);
