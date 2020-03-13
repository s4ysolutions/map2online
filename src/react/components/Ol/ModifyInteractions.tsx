import React, {useEffect} from 'react';
import {Modify as ModifyInteraction} from 'ol/interaction';
import Collection from 'ol/Collection';
import mapContext from './context/map';
import useVisibleFeatures from './hooks/useVisibleFeatures';
import {Coordinate, Feature, Features, ID, isPoint} from '../../../app-rx/catalog';
import {ol2coordinate, ol2coordinates} from './lib/coordinates';

const ModifyInteractions: React.FunctionComponent = (): React.ReactElement => {
  const map = React.useContext(mapContext);
  const features: Features = useVisibleFeatures();
  const featuresById = React.useMemo<Record<ID, Feature>>(() => Array.from(features).reduce(
    (cache, f) => ({...cache, [f.id]: f,}), {}
  ), [features]);

  const modifyInteractionRef = React.useRef(null);

  const handleModifyEnd = React.useCallback((ev) => {
      console.log('dbg handleModifyEnd', ev);
      const {features} = ev;
      for (const olf of features.getArray()) {
        const olId = olf.getId();
        const featureToModify = featuresById[olId];
        if (featureToModify) {
          if (isPoint(featureToModify.geometry)) {
            const coordinate: Coordinate = ol2coordinate(olf.flatCoordinates);
            console.log('dbg coordinate', coordinate);
            featureToModify.updateCoordinates(coordinate);
          } else {
            const coordinates: Coordinate[] = ol2coordinates(olf.flatCoordinates);
            console.log('dbg coordinates', coordinates);
            featureToModify.updateCoordinates(coordinates);
          }
        }
      }
      ev.preventDefault();
    },
    [features, map]
  );

  useEffect(() => {
    if (modifyInteractionRef.current) {
      map.removeInteraction(modifyInteractionRef.current);
    }
    console.log('dbg snap', features);
    modifyInteractionRef.current = new ModifyInteraction({features: new Collection(features)});
    modifyInteractionRef.current.on('modifyend', handleModifyEnd);
    map.addInteraction(modifyInteractionRef.current);
  }, [features, map]);

  return null;
};

export default ModifyInteractions;