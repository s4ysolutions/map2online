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
import {merge} from 'rxjs';
import {Feature} from '../../../catalog';
import {getCatalog} from '../../../di-default';
import {setOlFeatureCoordinates} from './lib/feature';
import {useVisibleFeatures} from './hooks/useVisibleFeatures';
import {Geometry as OlGeometry} from 'ol/geom';

const catalog = getCatalog();

const SnapInteractions: React.FunctionComponent = (): React.ReactElement | null => {
  const map = React.useContext(olMapContext);
  const olFeatures: OlFeature<OlGeometry>[] = useVisibleFeatures();
  const snapInteractionRef = React.useRef<SnapInteraction | null>(null);

  useEffect(() => {
    if (map === null) {
      return () => null;
    }
    if (snapInteractionRef.current) {
      map.removeInteraction(snapInteractionRef.current);
    }
    snapInteractionRef.current = new SnapInteraction({features: new Collection(olFeatures)});
    map.addInteraction(snapInteractionRef.current);

    const featuresObservables = olFeatures
      .map(olFeature => olFeature.getId())
      .filter(id => Boolean(id))
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      .map(id => catalog.featureById(id!.toString()))
      .filter(feature => Boolean(feature))
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      .map(feature => feature!.observable());

    const olFeaturesById: Record<string, OlFeature<OlGeometry>> = {};

    olFeatures.forEach(olFeature => {
      const id = olFeature.getId()?.toString();
      if (id) {
        olFeaturesById[id] = olFeature;
      }
    });

    const featuresObservable = merge(...featuresObservables)
      .subscribe((feature: Feature | null) => {
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
