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
import {Feature, isPoint} from '../../../app-rx/catalog';
import {defaults as defaultControls, ZoomToExtent} from 'ol/control';
import {getDesigner} from '../../../di-default';
import useObservable from '../../hooks/useObservable';
import {map as rxMap} from 'rxjs/operators';
import {getBottomRight, getSize, getTopLeft} from 'ol/extent';
import Timeout = NodeJS.Timeout;

let resizeTimer: Timeout = null;

const designer = getDesigner();
const OlMap: React.FunctionComponent = (): React.ReactElement => {
  const [map, setMap] = React.useState<Map>(null);
  log.render(`OlMap map is ${map ? 'set' : 'not set'}`);

  const features = useObservable<Feature[]>(
    designer.visibleFeatures.observable()
      .pipe(rxMap(vf => Array.from(vf))),
    Array.from(designer.visibleFeatures)
  );
  console.log('dbf features', {features});
  const extent: number[] = React.useMemo(() => {
    let ext = [] as number[];
    for (const feature of Array.from(features)) {
      if (isPoint(feature.geometry)) {
        ext.push(feature.geometry.coordinate.lon);
        ext.push(feature.geometry.coordinate.lat);
      } else {
        for (const coordinate of feature.geometry.coordinates) {
          ext.push(coordinate.lon);
          ext.push(coordinate.lat);
        }
      }
    }
    if (ext.length === 0) {
      return [-10000, 10000, 10000, -10000];
    } else if (ext.length > 2) {
      const [tlx, tly] = getTopLeft(ext);
      const [brx, bry] = getBottomRight(ext);
      const [width, height] = getSize(ext);
      const dx = width / 16;
      const dy = height / 16;
      return [tlx - dx, tly + dy, brx + dx, bry - dy];
    } else {
      return [ext[0] - 1000, ext[1] + 1000, ext[0] + 1000, ext[1] - 1000];
    }
  }, [features]);
  const zoomToExtentRef = React.useRef(null);

  const mapAttach = React.useCallback((el: HTMLDivElement): void => {
    log.render('mapAttach', el);
    zoomToExtentRef.current =
      new ZoomToExtent({extent});
    const m = new Map({
      controls: defaultControls().extend([
        zoomToExtentRef.current
      ]),
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

  React.useEffect(() => {
    if (map) {
      zoomToExtentRef.current.extent = extent;
    }
  }, [map, extent]);


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
