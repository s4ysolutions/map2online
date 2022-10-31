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

import {getBaseLayer} from '../../../../di-default';
import {getMapDefinition} from '../../../../map-sources/definitions';
import {map} from 'rxjs/operators';
import useObservable from '../../../hooks/useObservable';

const baseLayer = getBaseLayer();
const observable = baseLayer.sourceNameObservable().pipe(map(name => getMapDefinition(name)));

const useMapDefinition = () => useObservable(observable, getMapDefinition(baseLayer.sourceName));
export default useMapDefinition;
