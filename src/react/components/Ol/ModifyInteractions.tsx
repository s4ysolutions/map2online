import React, {useEffect} from 'react';
import {Modify as ModifyInteraction} from 'ol/interaction';
import Collection from 'ol/Collection';
import mapContext from './context/map';
import useVisibleFeatures from './hooks/useVisibleFeatures';
import {Coordinate, coordinateEq, Features, isPoint} from '../../../app-rx/catalog';
import {ol2coordinate, ol2coordinates} from './lib/coordinates';
import {getCatalog} from '../../../di-default';

const catalog = getCatalog();

const ModifyInteractions: React.FunctionComponent = (): React.ReactElement => {
  const map = React.useContext(mapContext);
  const features: Features = useVisibleFeatures();

  const modifyInteractionRef = React.useRef(null);

  const handleModifyEnd = React.useCallback((ev) => {
      const {features} = ev;

      for (const olf of features.getArray()) {
        const olId = olf.getId();
        const featureToModify = catalog.featureById(olId);
        if (featureToModify) {
          const flatCoordinates: number[] = olf.get('geometry').flatCoordinates;
          if (isPoint(featureToModify.geometry)) {
            const coordinate: Coordinate = ol2coordinate(flatCoordinates);
            if (!coordinateEq(coordinate, featureToModify.geometry.coordinate)) {
              featureToModify.updateCoordinates(coordinate);
              break;
            }
          } else {
            const coordinates: Coordinate[] = ol2coordinates(flatCoordinates);
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
    modifyInteractionRef.current = new ModifyInteraction({features: new Collection(features)});
    modifyInteractionRef.current.on('modifyend', handleModifyEnd);
    map.addInteraction(modifyInteractionRef.current);
  }, [features, map]);

  return null;
};

export default ModifyInteractions;