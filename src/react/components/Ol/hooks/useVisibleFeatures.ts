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

import {getDesigner} from '../../../../di-default';
import {olFeatureFactory} from '../lib/feature';
import {VisibleFeatures} from '../../../../app-rx/ui/designer';
import OlFeature from 'ol/Feature';
import useObservable from '../../../hooks/useObservable';
import {debounceTime, map} from 'rxjs/operators';
import {Feature} from '../../../../app-rx/catalog';
import {Observable} from 'rxjs';

const transformVisibleFeatures = (features: VisibleFeatures): OlFeature[] => Array.from<Feature>(features).map(feature => olFeatureFactory(feature));

const observable: Observable<OlFeature[]> = getDesigner()
  .visibleFeatures
  .observable()
  .pipe(map((f) => transformVisibleFeatures(f)));

const DEBOUNCE_DELAY = 250;
const observableDebonced: Observable<OlFeature[]> = getDesigner()
  .visibleFeatures
  .observable()
  .pipe(
    debounceTime(DEBOUNCE_DELAY),
    map((f) => transformVisibleFeatures(f)),
  );


export const useVisibleFeatures = (): OlFeature[] => {
  const visibleFeatures: OlFeature[] = transformVisibleFeatures(getDesigner().visibleFeatures);
  return useObservable(observable, visibleFeatures);
};

export const useVisibleFeaturesDebounced = (): OlFeature[] => {
  const visibleFeatures: OlFeature[] = transformVisibleFeatures(getDesigner().visibleFeatures);
  return useObservable(observableDebonced, visibleFeatures);
};

