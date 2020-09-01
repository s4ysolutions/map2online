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

import {KV} from './index';
import {Subject} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import log from '../log';

interface LocalStorage {
  subject: Subject<{ key: string; value: unknown }>
}

const localStorageSingleton: KV & LocalStorage = {
  get <T>(key: string, defaultValue?: T, forcedJSON?: string) {
    if (forcedJSON) {
      return JSON.parse(forcedJSON);
    }
    const serialized = window.localStorage.getItem(key);
    return serialized ? JSON.parse(serialized) : defaultValue;
  },
  subject: new Subject<{ key: string, value: unknown }>(),
  set <T>(key: string, value: T) {
    log.debug(`localStorage set ${key}`, value);
    if (value === undefined) {
      window.localStorage.removeItem(key);
    } else {
      const valueToStore = value instanceof Function ? value(this.get(key)) : value;
      const json = JSON.stringify(valueToStore);
      try {
        window.localStorage.setItem(
          key,
          json,
        );
      } catch (err) {
        log.error('localStorage "set" failed', err);
      }
    }
    this.subject.next({key, value});
  },
  delete <T>(key: string) {
    log.debug(`localStorage remove ${key}`);
    window.localStorage.removeItem(key);
    this.subject.next({key, value: null});
  },
  observable <T>(key?: string) {
    return key
      ? this.subject.pipe(
        filter<{ key: string; value: unknown }>((r): boolean => r.key === key),
        map<{ key: string; value: unknown }, unknown>((r) => r.value),
      )
      : this.subject;
  },
};

export default localStorageSingleton;
