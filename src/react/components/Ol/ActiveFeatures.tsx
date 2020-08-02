import React, {useEffect} from 'react';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import useVisibleFeatures from './hooks/useVisibleFeatures';
import log from '../../../log';
import olMapContext from './context/map';
import {Features} from '../../../app-rx/catalog';

const source = new VectorSource({wrapX: false});
const layer = new VectorLayer({source: source});

const ActiveFeatures: React.FunctionComponent = (): React.ReactElement => {
  const features: Features = useVisibleFeatures();
  const map = React.useContext(olMapContext);

  useEffect(() => {
    map.addLayer(layer);
  }, [map]);

  useEffect(() => {
    source.clear();
    source.addFeatures(features);
  }, [features, map]);


  log.render('ActiveFeatures');

  return null;
};

export default ActiveFeatures;