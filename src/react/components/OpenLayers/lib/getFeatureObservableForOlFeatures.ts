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

import OlFeature from 'ol/Feature';
import {Geometry as OlGeometry} from 'ol/geom';
import {getCatalog} from '../../../../di-default';
import {Observable, merge} from 'rxjs';
import {Feature} from '../../../../catalog';

const catalog = getCatalog();

const getFeatureObservableForOlFeatures = (olFeatures: OlFeature<OlGeometry>[]): Observable<Feature | null> => {
  const featuresObservables = olFeatures
    .map(olFeature => olFeature.getId())
    .filter(id => Boolean(id))
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    .map(id => catalog.featureById(id!.toString()))
    .filter(feature => Boolean(feature))
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    .map(feature => feature!.observable());

  return merge(...featuresObservables);
};

export default getFeatureObservableForOlFeatures;
