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

import {ImportUI} from '../index';
import {Subject} from 'rxjs';
import {ImportTo} from '../../../importer/import-to';
import {KV} from '../../../kv-rx';

export const importUIFactory = (storage: KV): ImportUI => {
  let visible = false;
  const visibleSubject = new Subject<boolean>();
  const th: ImportUI = {
    get importTo() {
      return storage.get('impto', ImportTo.ALL_CATEGORIES_TO_CATALOG);
    },
    set importTo(value) {
      storage.set('impto', value);
    },
    importToObservable: () => storage.observable<ImportTo>('impto'),
    close() {
      this.visible = false;
    },
    open() {
      this.visible = true;
    },
    get visible() {
      return visible;
    },
    set visible(value) {
      visible = value;
      visibleSubject.next(visible);
    },
    visibleObservable: () => visibleSubject,
  };
  th.close = th.close.bind(th);
  th.open = th.open.bind(th);
  return th;
};
