/* eslint-disable func-names */
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
import {Observable, Subject} from 'rxjs';
import {filter, map} from 'rxjs/operators';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const indexDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
const STORE_NAME = 'kv';

const indexDBFactory = (name: string): Promise<KV> => {
  const subject = new Subject<{ key: string, value: unknown }>();

  if (!indexDB) {
    return Promise.resolve(null);
  }

  return new Promise<IDBDatabase>((rs, rj) => {
    const dbRequest = indexedDB.open(name, 1);
    dbRequest.onerror = function (err) {
      rj(err);
    };
    dbRequest.onupgradeneeded = function () {
      this.result.createObjectStore(STORE_NAME);
    };

    dbRequest.onsuccess = function () {
      return dbRequest.result;
    };
  }).then(db => {
    const r = () => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      return tx.objectStore(STORE_NAME);
    };
    const w = () => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      return tx.objectStore(STORE_NAME);
    };

    const kv: KV = {
      delete(key: string): Promise<void> {
        return new Promise((rs, rj) => {
          const req: IDBRequest<IDBValidKey> = w().delete(key);
          req.onsuccess = function () {
            subject.next({key, value: undefined});
            rs();
          };
          req.onerror = function () {
            rj(this.error);
          };
        });
      },
      get<T>(key: string, def: T, forcedJSON: string | undefined): Promise<T> {
        if (forcedJSON) {
          return Promise.resolve(JSON.parse(forcedJSON));
        }
        return new Promise((rs, rj) => {
          const req = r().get(key);
          req.onsuccess = function () {
            rs(req.result === null ? def : req.result);
          };
          req.onerror = function () {
            rj(this.error);
          };
        });
      },
      observable<T>(key: string | undefined): Observable<T> {
        return key
          ? this.subject.pipe(
            filter<{ key: string; value: unknown }>((v): boolean => v.key === key),
            map<{ key: string; value: unknown }, unknown>((v) => v.value),
          )
          : this.subject;
      },
      set<T>(key: string, value: T): Promise<void> {
        return new Promise((rs, rj) => {
          const req: IDBRequest<IDBValidKey> = w().put(value, key);
          req.onsuccess = function () {
            subject.next({key, value});
            rs();
          };
          req.onerror = function () {
            rj(this.error);
          };
        });
      },
    };

    return kv;
  });
};

export default indexDBFactory;
