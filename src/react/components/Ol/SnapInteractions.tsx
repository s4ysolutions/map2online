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
import {Snap as SnapInteraction} from 'ol/interaction';
import Collection from 'ol/Collection';
import olMapContext from './context/map';
import OlFeature from 'ol/Feature';
import {Feature} from '../../../app-rx/catalog';
import {merge} from 'rxjs';
import {getCatalog} from '../../../di-default';
import {setOlFeatureCoordinates} from './lib/feature';
import {useVisibleFeaturesDebounced} from './hooks/useVisibleFeatures';

const catalog = getCatalog();

const SnapInteractions: React.FunctionComponent = (): React.ReactElement => {
  const map = React.useContext(olMapContext);
  const olFeatures: OlFeature[] = useVisibleFeaturesDebounced();
  const snapInteractionRef = React.useRef(null);

  useEffect(() => {
    if (snapInteractionRef.current) {
      map.removeInteraction(snapInteractionRef.current);
    }
    snapInteractionRef.current = new SnapInteraction({features: new Collection(olFeatures)});
    map.addInteraction(snapInteractionRef.current);

    const featuresObservables = olFeatures.map(olFeature => catalog.featureById(olFeature.getId().toString()).observable());
    const olFeaturesById: Record<string, OlFeature> = {};
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
      if (snapInteractionRef.current) {
        map.removeInteraction(snapInteractionRef.current);
        snapInteractionRef.current = null;
      }
    };
  }, [olFeatures, map]);

  return null;
};

export default SnapInteractions;
