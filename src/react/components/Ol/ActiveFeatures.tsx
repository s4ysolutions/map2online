import React, {useEffect} from 'react';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import useVisibleFeatures from './hooks/useVisibleFeatures';
import log from '../../../log';
import olMapContext from './context/map';
import OlFeature from 'ol/Feature';

const source = new VectorSource({wrapX: false});
const layer = new VectorLayer({source: source});

const ActiveFeatures: React.FunctionComponent = (): React.ReactElement => {
  const features: OlFeature[] = useVisibleFeatures();
  const map = React.useContext(olMapContext);

  useEffect(() => {
    map.addLayer(layer);
    return () => map.removeLayer(layer)
  }, [map]);

  source.clear();
  source.addFeatures(features);

  log.render('ActiveFeatures');

  return null;
};

export default ActiveFeatures;