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

import {KV} from '../../../src/kv-rx';
import {Subject} from 'rxjs';
import {filter, map} from 'rxjs/operators';

const memoryStorageFactory = (): KV => {
  const subject = new Subject<{ key: string, value: any }>();
  const mem: Record<string, string> = {};
  return {
    get <T>(key: string, defaultValue: T, forcedJSON?: string) {
      if (forcedJSON) {
        return JSON.parse(forcedJSON);
      }
      const serialized = mem[key];
      return serialized ? JSON.parse(serialized) : defaultValue;
    },
    set <T>(key: string, value: T) {
      if (value === undefined) {
        delete (mem[key]);
      } else {
        const valueToStore = value instanceof Function ? value(this.get(key)) : value;
        const json = JSON.stringify(valueToStore);
        mem[key] = json;
      }
      subject.next({key, value});
    },
    hasKey (key: string): boolean {
      return mem[key] !== undefined;
    },
    delete <T>(key: string) {
      delete (mem[key]);
      subject.next({key, value: null});
    },
    observable <T>(key?: string) {
      return key
        ? subject.pipe(
          filter<{ key: string; value: any }>((r): boolean => r.key === key),
          map<{ key: string; value: any }, any>((r) => r.value),
        )
        : subject;
    },
  };
};

export default memoryStorageFactory;
