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
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import OlFeature from 'ol/Feature';
import {Feature} from '../../../../catalog';
import {setOlFeatureCoordinates, setOlFeatureStyle} from '../lib/feature';
import {Geometry as OlGeometry} from 'ol/geom';
import {debounceTime} from 'rxjs/operators';
import getFeatureObservableForOlFeatures from '../lib/getFeatureObservableForOlFeatures';
import activeFeaturesContext from '../context/active-features-source';
import {useVisibleFeatures} from '../hooks/useVisibleFeatures';
import olMapContext from '../context/map';
import {LayerType} from '../lib/types';

const DEBOUNCE_DELAY = 50;

const source = new VectorSource({wrapX: false});
const layer = new VectorLayer({source, properties: {map2Id: LayerType.ACTIVE_FEATURES}});

let olFeaturesById: Record<string, OlFeature<OlGeometry>> = {};

// TODO: dirty hack - used by zoom 2 extent control
export const visibleOlFeatures = (): OlFeature<OlGeometry>[] => Object.values(olFeaturesById);

const ActiveFeaturesLayer: React.FunctionComponent<{ children: React.ReactNode[] | React.ReactNode}> =
  ({children}): React.ReactElement => {

    const map = React.useContext(olMapContext);

    // add layer
    useEffect(() => {
      map.addLayer(layer);
      return () => {
        map.removeLayer(layer);
      };
    }, [map]);

    const olFeatures = useVisibleFeatures();
    useEffect(() => {
      source.clear();
      source.addFeatures(olFeatures);

      olFeaturesById = {};
      olFeatures.forEach(olFeature => {
        const id = olFeature.getId()?.toString();
        if (id) {
          olFeaturesById[id] = olFeature;
        }
      });

      const featuresObservable = getFeatureObservableForOlFeatures(olFeatures)
        .pipe(debounceTime(DEBOUNCE_DELAY))
        .subscribe((feature: Feature | null) => {
          if (!feature) {
          // feature deletion is handled in the outer useEffect
            return;
          }
          const olFeature = olFeaturesById[feature.id];
          setOlFeatureCoordinates(olFeature, feature);
          // setOlFeatureTitle(olFeature, feature.title);
          setOlFeatureStyle(olFeature, feature);
        });
      return () => featuresObservable.unsubscribe();
    }, [map, olFeatures]);

    return <activeFeaturesContext.Provider value={source} >
      {children}
    </activeFeaturesContext.Provider>;
  };

export default ActiveFeaturesLayer;
