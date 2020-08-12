import React, {useEffect} from 'react';
import {Snap as SnapInteraction} from 'ol/interaction';
import Collection from 'ol/Collection';
import olMapContext from './context/map';
import useVisibleFeatures from './hooks/useVisibleFeatures';
import {Features} from '../../../app-rx/catalog';

const SnapInteractions: React.FunctionComponent = (): React.ReactElement => {
  const map = React.useContext(olMapContext);
  const features: Features = useVisibleFeatures();
  const snapInteractionRef = React.useRef(null);

  useEffect(() => {
    if (snapInteractionRef.current) {
      map.removeInteraction(snapInteractionRef.current);
    }
    snapInteractionRef.current = new SnapInteraction({features: new Collection(features)});
    map.addInteraction(snapInteractionRef.current);
    return () => {
      if (snapInteractionRef.current) {
        map.removeInteraction(snapInteractionRef.current);
        snapInteractionRef.current = null;
      }
    }
  }, [features, map]);

  return null;
};

export default SnapInteractions;