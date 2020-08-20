import React, {useEffect} from 'react';
import {Modify as ModifyInteraction} from 'ol/interaction';
import Collection from 'ol/Collection';
import olMapContext from './context/map';
import useVisibleFeatures from './hooks/useVisibleFeatures';
import {Coordinate, Feature, ID, coordinateEq, isPoint} from '../../../app-rx/catalog';
import {ol2coordinate, ol2coordinates} from './lib/coordinates';
import {getCatalog} from '../../../di-default';
import OlFeature from 'ol/Feature';
import log from '../../../log';
import {setModifying} from './hooks/useModifying';
import {merge} from 'rxjs';
import {setOlFeatureCoordinates} from './lib/feature';

const catalog = getCatalog();

const ModifyInteractions: React.FunctionComponent = (): React.ReactElement => {
  const map = React.useContext(olMapContext);
  const olFeatures: OlFeature[] = useVisibleFeatures();

  const modifyInteractionRef = React.useRef(null);

  const handleModifyStart = React.useCallback(() => {
    setModifying(true);
  }, []);

  const handleModifyEnd = React.useCallback(
    (ev) => {
      const {features} = ev;
      for (const olf of features.getArray()) {
        const olId = olf.getId();
        const featureToModify: Feature = catalog.featureById(olId);
        if (featureToModify) {
          const {flatCoordinates} = olf.get('geometry');
          if (isPoint(featureToModify.geometry)) {
            const coordinate: Coordinate = ol2coordinate(flatCoordinates);
            if (!coordinateEq(coordinate, featureToModify.geometry.coordinate)) {
              featureToModify.updateCoordinates(coordinate);
              break;
            }
          } else {
            const coordinates: Coordinate[] = ol2coordinates(flatCoordinates);
            featureToModify.updateCoordinates(coordinates);
            break;
          }
        } else {
          log.error(`No features to modify id=${olId}`);
        }
      }
      ev.preventDefault();
      setModifying(false);
    },
    [],
  );

  useEffect(() => {
    if (modifyInteractionRef.current) {
      modifyInteractionRef.current.un('modifyend', handleModifyEnd);
      modifyInteractionRef.current.un('modifystart', handleModifyStart);
      map.removeInteraction(modifyInteractionRef.current);
    }
    modifyInteractionRef.current = new ModifyInteraction({features: new Collection(olFeatures)});
    modifyInteractionRef.current.on('modifyend', handleModifyEnd);
    modifyInteractionRef.current.on('modifystart', handleModifyStart);
    map.addInteraction(modifyInteractionRef.current);

    const featuresObservables = olFeatures.map(olFeature => catalog.featureById(olFeature.getId().toString()).observable());
    const olFeaturesById: Record<ID, OlFeature> = {};

    olFeatures.forEach(olFeature => {
      olFeaturesById[olFeature.getId().toString()] = olFeature;
    });
    const featuresObservable = merge(...featuresObservables).subscribe((feature: Feature) => {
      if (!feature) {
        return;
      } // feature deletion is handled in the other useEffect
      const olFeature = olFeaturesById[feature.id];
      if (olFeature) {
        setOlFeatureCoordinates(olFeature, feature);
      }
    });

    return () => {
      featuresObservable.unsubscribe();
      if (modifyInteractionRef.current) {
        modifyInteractionRef.current.un('modifyend', handleModifyEnd);
        modifyInteractionRef.current.un('modifystart', handleModifyStart);
        map.removeInteraction(modifyInteractionRef.current);
        modifyInteractionRef.current = null;
      }
    };
  }, [map, handleModifyEnd, handleModifyStart, olFeatures]);

  return null;
};

export default ModifyInteractions;
