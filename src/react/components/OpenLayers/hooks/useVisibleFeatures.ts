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

import {getCatalog} from '../../../../di-default';
import {olFeatureFactory} from '../lib/feature';
import OlFeature from 'ol/Feature';
import useObservable from '../../../hooks/useObservable';
import {map} from 'rxjs/operators';
import {Feature} from '../../../../catalog';
import {Observable} from 'rxjs';
import {Geometry as OlGeometry} from 'ol/geom';

const transformVisibleFeatures = (features: Feature[]): OlFeature<OlGeometry>[] =>
  features.map(feature => olFeatureFactory(feature));

const observable: Observable<OlFeature<OlGeometry>[]> = getCatalog()
  .visibleFeaturesObservable()
  .pipe(map((f) => transformVisibleFeatures(f)));

export const useVisibleFeatures = (): OlFeature<OlGeometry>[] => {
  const visibleFeatures: OlFeature<OlGeometry>[] = transformVisibleFeatures(getCatalog().visibleFeatures);
  return useObservable(observable, visibleFeatures);
};

