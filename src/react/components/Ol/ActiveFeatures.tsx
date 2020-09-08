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
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import {useVisibleFeaturesDebounced} from './hooks/useVisibleFeatures';
import log from '../../../log';
import olMapContext from './context/map';
import OlFeature from 'ol/Feature';
import {getCatalog} from '../../../di-default';
import {merge} from 'rxjs';
import {Feature} from '../../../catalog';
import {setOlFeatureCoordinates} from './lib/feature';

const catalog = getCatalog();

const source = new VectorSource({wrapX: false});
const layer = new VectorLayer({source});

let olFeaturesById: Record<string, OlFeature> = {};

// used by zoom 2 extent control
export const visibleOlFeatures = (): OlFeature[] => Object.values(olFeaturesById);

const ActiveFeatures: React.FunctionComponent = (): React.ReactElement => {
  const olFeatures: OlFeature[] = useVisibleFeaturesDebounced();
  const map = React.useContext(olMapContext);


  useEffect(() => {
    map.addLayer(layer);
    return () => {
      map.removeLayer(layer);
    };
  }, [map]);

  useEffect(() => {
    source.clear();
    source.addFeatures(olFeatures);

    const featuresObservables = olFeatures.map(olFeature => catalog.featureById(olFeature.getId().toString()).observable());
    olFeaturesById = {};
    olFeatures.forEach(olFeature => {
      olFeaturesById[olFeature.getId().toString()] = olFeature;
    });
    // subsribe to feature modifications
    const featuresObservable = merge(...featuresObservables).subscribe((feature: Feature) => {
      if (!feature) {
        return;
      } // feature deletion is handled in the outer useEffect
      const olFeature = olFeaturesById[feature.id];
      setOlFeatureCoordinates(olFeature, feature);
    });
    return () => featuresObservable.unsubscribe();
  }, [map, olFeatures]);

  log.render('ActiveFeatures');

  return null;
};

export default ActiveFeatures;
