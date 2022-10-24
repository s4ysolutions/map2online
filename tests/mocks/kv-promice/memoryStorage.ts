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

import {Observable, Subject} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import {KvPromise} from '../../../src/kv/promise';

export interface MemoryStoragePromise extends KvPromise {
  readonly mem: Record<string, unknown>;
}

const MIN_DELAY = 5;
const MAX_DELAY = 20;
const wrap = <T>(body: () => T) => new Promise<T>((rs) => {
  setTimeout(() => rs(body()), MIN_DELAY + Math.random() * (MAX_DELAY - MIN_DELAY));
});

const memoryStoragePromiseFactory = (init: Record<string, string> = {}): MemoryStoragePromise => {
  const subject = new Subject<{ key: string, value: unknown }>();
  const subjectDeleted = new Subject<{ key: string, value: unknown }>();
  const mem: Record<string, unknown> = init;
  const th: MemoryStoragePromise = {
    get mem() {
      return mem;
    },
    get<T>(key: string, defaultValue: T, forcedJSON?: string): Promise<T> {
      return wrap<T>(() => {
        if (forcedJSON) {
          return JSON.parse(forcedJSON);
        }
        const memoized = mem[key] as T;
        return memoized ? memoized : defaultValue;
      });
    },
    set<T>(key: string, value: T): Promise<void> {
      const promise =
        (value === undefined)
          ? wrap(() => delete mem[key])
          : value instanceof Function
            ? this.get(key, null as T).then((memoized: T | null) => wrap(() => {
              mem[key] = value(memoized);
            }))
            : wrap(() => {
              mem[key] = value;
            });
      return promise.then(() => {
        subject.next({key, value});
      });
    },
    delete<T>(key: string): Promise<T | null> {
      return wrap<T | null>(() => {
        const ret = mem[key] === undefined ? null : mem[key] as T;
        delete (mem[key]);
        subjectDeleted.next({key, value: ret});
        return ret;
      });
    },
    observable<T>(key?: string): Observable<T> {
      return subject.pipe(
        filter<{ key: string; value: unknown }>((r): boolean => r.key === key),
        map<{ key: string; value: unknown }, T>((r) => r.value as T),
      );
    },
    observableDelete<T>(key?: string): Observable<T | null> {
      return subjectDeleted.pipe(
        filter<{ key: string; value: unknown }>((r): boolean => r.key === key),
        map<{ key: string; value: unknown }, T | null>((r) => r.value as T | null),
      );
    },
  };

  return th;
};

export default memoryStoragePromiseFactory;
