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
import SnapInteractions from './SnapInteractions';
import ModifyInteractions from './ModifyInteractions';
import ResizeObserver from 'resize-observer-polyfill';
import Timeout = NodeJS.Timeout;

let resizeTimer: Timeout = null;

const OlMap: React.FunctionComponent = (): React.ReactElement => {
  const [map, setMap] = React.useState<Map>(null);
  log.render(`OlMap map is ${map ? 'set' : 'not set'}`);

  const mapAttach = React.useCallback((el: HTMLDivElement): void => {
    log.render('mapAttach', el);
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

  React.useEffect(() => {
    if (map) {
      const el = map.getTargetElement();
      const resizeObserver = new ResizeObserver(entries => {
        if (entries.length > 0) {
          if (resizeTimer) {
            clearTimeout(resizeTimer);
          }
          resizeTimer = setTimeout(() => {
            map.updateSize();
            resizeTimer = null;
          }, 100);
        }
      });
      resizeObserver.observe(el);
      return () => resizeObserver.disconnect();
    } else {
      return () => 0;
    }
  }, [map]);

  return <div className="ol-container" ref={mapAttach} >
    {map && <mapContext.Provider value={map} >
      <BaseLayer />
      <ActiveFeatures />
      <DrawInteractions />
      <ModifyInteractions />
      <SnapInteractions />
    </mapContext.Provider >}
  </div >
};

export default React.memo(OlMap);
