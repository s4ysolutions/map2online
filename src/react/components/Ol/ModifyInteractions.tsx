/*
 * Copyright 2019 s4y.solutions
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, {useEffect} from 'react';
import {Modify as ModifyInteraction} from 'ol/interaction';
import Collection from 'ol/Collection';
import olMapContext from './context/map';
import OlFeature from 'ol/Feature';
import {merge} from 'rxjs';
import {Coordinate, Feature, ID, coordinateEq, isPoint} from '../../../catalog';
import {getCatalog} from '../../../di-default';
import {setOlFeatureCoordinates} from './lib/feature';
import {useVisibleFeatures} from './hooks/useVisibleFeatures';
import {Geometry as OlGeometry} from 'ol/geom';
import {ModifyEvent} from 'ol/interaction/Modify';
import log from '../../../log';
import {setModifying} from './hooks/useModifying';
import {ol2coordinate, ol2coordinates} from './lib/coordinates';

const catalog = getCatalog();

const ModifyInteractions: React.FunctionComponent = (): React.ReactElement | null => {
  const map = React.useContext(olMapContext);
  const olFeatures: OlFeature<OlGeometry>[] = useVisibleFeatures();
  const modifyInteractionRef = React.useRef<ModifyInteraction | null>(null);

  const handleModifyStart = React.useCallback(() => {
    setModifying(true);
  }, []);

  const handleModifyEnd = React.useCallback(
    (ev: ModifyEvent) => {
      const {features} = ev;
      for (const olf of features.getArray()) {
        const olId = olf.getId();
        if (olId) {
          const featureToModify: Feature | null = catalog.featureById(olId.toString());
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
      if (map) {
        map.removeInteraction(modifyInteractionRef.current);
      }
    }
    if (!map) {
      return () => null;
    }
    modifyInteractionRef.current = new ModifyInteraction({features: new Collection(olFeatures)});
    modifyInteractionRef.current.on('modifyend', handleModifyEnd);
    modifyInteractionRef.current.on('modifystart', handleModifyStart);
    map.addInteraction(modifyInteractionRef.current);

    const featuresObservables =
      olFeatures.map(olFeature => olFeature.getId())
        .filter(id => Boolean(id))
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        .map(id => catalog.featureById(id!.toString()))
        .filter(feature => Boolean(feature))
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        .map(feature => feature!.observable());

    const olFeaturesById: Record<ID, OlFeature<OlGeometry>> = {};

    olFeatures.forEach(olFeature => {
      const id = olFeature.getId();
      if (id) {
        olFeaturesById[id.toString()] = olFeature;
      }
    });

    const featuresObservable = merge(...featuresObservables).subscribe((feature: Feature | null) => {
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
