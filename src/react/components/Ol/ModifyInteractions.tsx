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
import olMapContext from './context/map';
import {Coordinate, Feature, coordinateEq, isPoint} from '../../../catalog';
import {getCatalog} from '../../../di-default';
import {ModifyEvent} from 'ol/interaction/Modify';
import log from '../../../log';
import {setModifying} from './hooks/useModifying';
import {ol2coordinate, ol2coordinates} from './lib/coordinates';
import activeFeaturesContext from './context/active-features-source';

const catalog = getCatalog();

const ModifyInteractions: React.FunctionComponent = (): React.ReactElement | null => {

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
      setModifying(false);
    },
    [],
  );

  const map = React.useContext(olMapContext);
  const source = React.useContext(activeFeaturesContext);
  const modifyInteractionRef = React.useRef<ModifyInteraction | null>(null);

  useEffect(() => {
    if (modifyInteractionRef.current) {
      modifyInteractionRef.current.un('modifyend', handleModifyEnd);
      modifyInteractionRef.current.un('modifystart', handleModifyStart);
      map.removeInteraction(modifyInteractionRef.current);
    }

    modifyInteractionRef.current = new ModifyInteraction({source});
    modifyInteractionRef.current.on('modifyend', handleModifyEnd);
    modifyInteractionRef.current.on('modifystart', handleModifyStart);
    map.addInteraction(modifyInteractionRef.current);
  }, [map, handleModifyEnd, handleModifyStart, source]);

  return null;
};

export default ModifyInteractions;
