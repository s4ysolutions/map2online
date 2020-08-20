import * as React from 'react';
import {useEffect} from 'react';
import log from '../../../log';
import './styles.scss';
import {getBaseLayer} from '../../../di-default';
import useObservable from '../../hooks/useObservable';
import {getMapDefinition, isGoogleMapDefinition} from '../../../map-sources/definitions';
import mapContext from './context/map';
import BaseLayer from './BaseLayer';
import {sourceNameToMapId} from './lib/mapid';
import {Subscription} from 'rxjs';
import {googleLonLat} from '../../../lib/googlemap';

const baseLayer = getBaseLayer();
let stateSubscription: Subscription = null;
let draggingSubscription: Subscription = null;
let recentMap: google.maps.Map = null;

const moveRecentMap = (x: number, y: number, zoom: number) => {
  if (recentMap) {
    const c = recentMap.getCenter();
    const cc = googleLonLat(x, y);
    if (c.lat() !== cc.lat || c.lng() !== cc.lng) {
      recentMap.setCenter(cc);
    }
    if (zoom !== recentMap.getZoom()) {
      recentMap.setZoom(zoom);
    }
  }
};

const GoogleMap: React.FunctionComponent = (): React.ReactElement => {
  const baseLayerName = useObservable(baseLayer.sourceNameObservable(), baseLayer.sourceName);
  const [map, setMap] = React.useState<google.maps.Map>(null);
  recentMap = map;
  log.render(`GoogleMap map is ${map ? 'set' : 'not set'} sourceName=${baseLayerName}`);

  const mapAttach = React.useCallback((el: HTMLDivElement): void => {
    log.render('GoogleMap mapAttach', el);

    if (!el) {
      setMap(null);
      return;
    }

    const {state} = baseLayer;
    const center: google.maps.LatLngLiteral = googleLonLat(state.x, state.y);

    const m = new google.maps.Map(el, {
      center,
      mapTypeId: sourceNameToMapId(baseLayerName),
      disableDefaultUI: true,
      zoom: state.zoom,
    });

    setMap(m);

  }, [baseLayerName]);

  useEffect(() => {
    log.d('dbg', 'subscribe');
    if (stateSubscription) {
      stateSubscription.unsubscribe();
      stateSubscription = null;
    }
    if (draggingSubscription) {
      draggingSubscription.unsubscribe();
      draggingSubscription = null;
    }
    stateSubscription = baseLayer.stateObservable().subscribe(state => {
      moveRecentMap(state.x, state.y, state.zoom);
    });
    draggingSubscription = baseLayer.draggingObservable().subscribe(coord => {
      moveRecentMap(coord.lon, coord.lat, baseLayer.state.zoom);
    });
    return () => {
      if (stateSubscription) {
        stateSubscription.unsubscribe();
        stateSubscription = null;
      }
      if (draggingSubscription) {
        draggingSubscription.unsubscribe();
        draggingSubscription = null;
      }
    };
  }, []);

  const md = getMapDefinition(baseLayerName);
  return md && isGoogleMapDefinition(md) && <div className="google-map-container" ref={mapAttach} >
    {map && <mapContext.Provider value={map} >
      <BaseLayer />
    </mapContext.Provider >}
  </div >;
};

export default React.memo(GoogleMap);
