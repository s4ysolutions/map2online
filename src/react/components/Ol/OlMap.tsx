import 'ol/ol.css';
import './styles.scss';
import * as React from 'react';
import Map from 'ol/Map';
import OlSource from './OlSource';
import View from 'ol/View';
import log from '../../../log';
import {getBaseLayer} from '../../../di-default';
import useObservable from '../../hooks/useObservable';

const baseLayer = getBaseLayer();

interface OlMapState {
  map: Map;
}

const OlMapAttached: React.FunctionComponent<OlMapState> = ({map}): React.ReactElement => {
  const baseLayerName = useObservable(baseLayer.sourceNameObservable(), baseLayer.sourceName);
  log.render(`OlMapAttached baseLayer=${baseLayerName}`);
  return <OlSource map={map} source={baseLayerName} />;
};

const OlMap: React.FunctionComponent = (): React.ReactElement => {

  const [map, setMap] = React.useState<Map>(null);
  log.render(`OlMap map is ${map ? 'set' : 'not set'}`);

  const mapAttach = React.useCallback((el: HTMLDivElement): void => {
    log.render('mapAttach');
    const m = new Map({
      target: el,
      view: new View({
        center: [
          0,
          0,
        ],
        zoom: 5,
      }),
    });
    setMap(m);
  }, []);

  return <div className="ol-container" ref={mapAttach} >
    {map && <OlMapAttached map={map} />}
  </div >
};

export default React.memo(OlMap);
