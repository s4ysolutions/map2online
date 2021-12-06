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

import {BaseLayer, BaseLayerState} from './index';
import {KV} from '../../../kv/sync';
import {Subject} from 'rxjs';
import {Coordinate} from '../../../catalog';

const baseLayerFactory = (persistentStorage: KV): BaseLayer => {
  const draggingSubject = new Subject<Coordinate>();
  return {
    get sourceName() {
      return persistentStorage.get('blsn', 'Openstreet');
    },
    set sourceName(name) {
      persistentStorage.set('blsn', name);
    },
    sourceNameObservable: () => persistentStorage.observable<string>('blsn'),
    get state() {
      return persistentStorage.get<BaseLayerState>('blst', {x: 0, y: 0, zoom: 2});
    },
    set state(state) {
      const s = this.state;
      if (s.x !== state.x || s.y !== state.y || s.zoom !== state.zoom) {
        persistentStorage.set<BaseLayerState>('blst', state);
      }
    },
    stateObservable: () => persistentStorage.observable<BaseLayerState>('blst'),
    draggingObservable: () => draggingSubject,
    setDragging(coordinate: Coordinate) {
      draggingSubject.next(coordinate);
    },
  };
};

export default baseLayerFactory;
