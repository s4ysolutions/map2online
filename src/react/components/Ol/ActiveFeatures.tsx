import React, {useEffect} from 'react';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import useVisibleFeatures from './hooks/useVisibleFeatures';
import log from '../../../log';
import mapContext from './context/map';
import {Features} from '../../../app-rx/catalog';

const source = new VectorSource({wrapX: false});
const layer = new VectorLayer({source: source});

const ActiveFeatures: React.FunctionComponent = (): React.ReactElement => {
  const features: Features = useVisibleFeatures();
  const map = React.useContext(mapContext);

  useEffect(() => {
    map.addLayer(layer);
  }, []);

  useEffect(() => {
    source.clear();
    source.addFeatures(features);
  }, [map, features]);


  log.render('ActiveFeatures');

  return null;
};

export default ActiveFeatures;