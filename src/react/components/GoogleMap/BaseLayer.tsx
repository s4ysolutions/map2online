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
    const mapTypeId = sourceNameToMapId(baseLayerName)
    if (map.getMapTypeId() != mapTypeId) {
      log.debug(`GoogleBaseLayer setMapTypeId=${mapTypeId}`);
      map.setMapTypeId(mapTypeId)
    } else {
      log.debug(`GoogleBaseLayer identical`);
    }
  }
  return null;
};

export default React.memo(BaseLayer);
