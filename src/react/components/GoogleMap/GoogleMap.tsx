import * as React from 'react';
import log from '../../../log';
import './styles.scss';
import {getBaseLayer} from '../../../di-default';
import useObservable from '../../hooks/useObservable';
import {getMapDefinition, isGoogleMapDefinition} from '../../../map-sources/definitions';
// noinspection ES6UnusedImports
import {} from 'googlemaps';
import {googleLonLat} from '../../../lib/projection';
import mapContext from './context/map';
import BaseLayer from './BaseLayer';
import {sourceNameToMapId} from './lib/mapid';

const baseLayer = getBaseLayer();

const GoogleMap: React.FunctionComponent = (): React.ReactElement => {
  const baseLayerName = useObservable(baseLayer.sourceNameObservable(), baseLayer.sourceName);
  const [map, setMap] = React.useState<google.maps.Map>(null);
  log.render(`GoogleMap map is ${map ? 'set' : 'not set'} sourceName=${baseLayerName}`);

  const mapAttach = React.useCallback((el: HTMLDivElement): void => {
    log.render('GoogleMap mapAttach', el);

    if (!el) {
      setMap(null)
      return
    }

    const state = baseLayer.state
    const center: google.maps.LatLngLiteral = googleLonLat(state.x, state.y)

    const m = new google.maps.Map(el, {
      center,
      mapTypeId: sourceNameToMapId(baseLayerName),
      disableDefaultUI: true,
      zoom: state.zoom
    });

    setMap(m)
  }, [])

  const md = getMapDefinition(baseLayerName);
  return md && isGoogleMapDefinition(md) && <div className="google-map-container" ref={mapAttach} >
    {map && <mapContext.Provider value={map} >
      <BaseLayer />
    </mapContext.Provider >}
  </div >
}

export default React.memo(GoogleMap);
