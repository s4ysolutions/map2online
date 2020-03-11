import 'ol/ol.css';
import './styles.scss';
import * as React from 'react';
import Map from 'ol/Map';
import BaseLayer from './BaseLayer';
import View from 'ol/View';
import log from '../../../log';
import ActiveFeatures from './ActiveFeatures';
import mapContext from './context/map';
import DrawInteractions from './DrawInteractions';

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
        zoom: 3,
      }),
    });
    setMap(m);
  }, []);

  return <div className="ol-container" ref={mapAttach} >
    {map && <mapContext.Provider value={map} >
      <BaseLayer />
      <ActiveFeatures />
      <DrawInteractions />
    </mapContext.Provider >}
  </div >
};

export default React.memo(OlMap);
