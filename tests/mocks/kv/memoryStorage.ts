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

import {KV} from '../../../src/kv/sync';
import {Observable, Subject} from 'rxjs';
import {filter, map} from 'rxjs/operators';

export interface MemoryStorage extends KV {
  readonly mem: Record<string, string>;
}

const memoryStorageFactory = (init: Record<string, string> = {}): MemoryStorage => {
  const subject = new Subject<{ key: string, value: unknown }>();
  const subjectDeleted = new Subject<{ key: string, value: unknown }>();
  const mem: Record<string, string> = init;
  return {
    get mem() {
      return mem;
    },
    get<T>(key: string, defaultValue: T, forcedJSON?: string) {
      if (forcedJSON) {
        return JSON.parse(forcedJSON);
      }
      const serialized = mem[key];
      return serialized ? JSON.parse(serialized) : defaultValue;
    },
    set<T>(key: string, value: T) {
      if (value === undefined) {
        delete (mem[key]);
      } else {
        const valueToStore = value instanceof Function ? value(this.get(key, null)) : value;
        mem[key] = JSON.stringify(valueToStore);
      }
      subject.next({key, value});
    },
    hasKey(key: string): boolean {
      return mem[key] !== undefined;
    },
    delete<T>(key: string): T | null {
      const existing = this.get(key, undefined);
      delete (mem[key]);
      const ret = existing === undefined ? null : existing;
      subjectDeleted.next({key, value: ret});
      return ret;
    },
    observable<T>(key: string): Observable<T> {
      return subject.pipe(
        filter<{ key: string; value: unknown }>((r): boolean => r.key === key),
        map<{ key: string; value: unknown }, T>((r) => r.value as T),
      );
    },
    observableDelete<T>(key: string): Observable<T | null> {
      return subjectDeleted.pipe(
        filter<{ key: string; value: unknown }>((r): boolean => r.key === key),
        map<{ key: string; value: unknown }, T>((r) => r.value as T),
      );
    },
  };
};

export default memoryStorageFactory;
