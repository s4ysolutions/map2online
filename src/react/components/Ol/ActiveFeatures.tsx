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
import log from '../../../log';
import olMapContext from './context/map';
import OlFeature from 'ol/Feature';
import {getCatalog} from '../../../di-default';
import {merge} from 'rxjs';
import {Feature} from '../../../catalog';
import {setOlFeatureCoordinates, setOlFeatureStyle} from './lib/feature';
import {useVisibleFeatures} from './hooks/useVisibleFeatures';
import {Geometry as OlGeometry} from 'ol/geom';
import {debounceTime} from 'rxjs/operators';

const DEBOUNCE_DELAY = 50;

const catalog = getCatalog();

const source = new VectorSource({wrapX: false});
const layer = new VectorLayer({source});

let olFeaturesById: Record<string, OlFeature<OlGeometry>> = {};

// used by zoom 2 extent control
export const visibleOlFeatures = (): OlFeature<OlGeometry>[] => Object.values(olFeaturesById);

const ActiveFeatures: React.FunctionComponent = (): React.ReactElement | null => {
  const olFeatures: OlFeature<OlGeometry>[] = useVisibleFeatures();
  const map = React.useContext(olMapContext);

  useEffect(() => {
    if (map) {
      map.addLayer(layer);
      return () => {
        map.removeLayer(layer);
      };
    }
    return () => null;
  }, [map]);

  useEffect(() => {
    source.clear();
    source.addFeatures(olFeatures);

    const featuresObservables = olFeatures
      .map(olFeature => olFeature.getId())
      .filter(id => Boolean(id))
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      .map(id => catalog.featureById(id!.toString()))
      .filter(feature => Boolean(feature))
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      .map(feature => feature!.observable());
    olFeaturesById = {};
    olFeatures.forEach(olFeature => {
      const id = olFeature.getId()?.toString();
      if (id) {
        olFeaturesById[id] = olFeature;
      }
    });
    // subsribe to feature modifications
    const featuresObservable = merge(...featuresObservables).pipe(debounceTime(DEBOUNCE_DELAY))
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

  log.render('ActiveFeatures');

  return null;
};

export default ActiveFeatures;
