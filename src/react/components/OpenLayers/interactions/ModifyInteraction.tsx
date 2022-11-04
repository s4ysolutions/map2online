/*
 * Copyright 2022 s4y.solutions
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, {useEffect} from 'react';
import {Modify as OlModifyInteraction} from 'ol/interaction';
import {Coordinate, Feature, coordinateEq, coordinatesEq, isPoint} from '../../../../catalog';
import {getCatalog} from '../../../../di-default';
import {ModifyEvent} from 'ol/interaction/Modify';
import log from '../../../../log';
import {setModifying} from '../hooks/useModifying';
import {ol2coordinate, ol2coordinates} from '../lib/coordinates';
import activeFeaturesContext from '../context/active-features-source';
import olMapContext from '../../OpenLayers/context/map';

const catalog = getCatalog();

const ModifyInteraction: React.FunctionComponent = (): React.ReactElement | null => {

  const map = React.useContext(olMapContext);

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
                break; // to let move the top feature if overlaps
              }
            } else {
              const coordinates: Coordinate[] = ol2coordinates(flatCoordinates);
              if (!coordinatesEq(coordinates, featureToModify.geometry.coordinates)) {
                featureToModify.updateCoordinates(coordinates);
                break;
              }
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

  const source = React.useContext(activeFeaturesContext);
  const modifyInteractionRef = React.useRef<OlModifyInteraction | null>(null);

  useEffect(() => {
    if (modifyInteractionRef.current) {
      modifyInteractionRef.current.un('modifyend', handleModifyEnd);
      modifyInteractionRef.current.un('modifystart', handleModifyStart);
      map.removeInteraction(modifyInteractionRef.current);
    }

    modifyInteractionRef.current = new OlModifyInteraction({source});
    modifyInteractionRef.current.on('modifyend', handleModifyEnd);
    modifyInteractionRef.current.on('modifystart', handleModifyStart);
    map.addInteraction(modifyInteractionRef.current);
  }, [map, handleModifyEnd, handleModifyStart, source]);

  return null;
};

export default ModifyInteraction;
