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

import {KvPromise} from './index';
import {filter, map} from 'rxjs/operators';
import log from '../../log';
import {openDB} from 'idb';
import {IDBPDatabase} from 'idb/build/entry';
import {Observable, Subject} from 'rxjs';

interface IndexedDB {
  _db: IDBPDatabase | null,
  readonly db: Promise<IDBPDatabase>
  readonly subject: Subject<{ key: string; value: unknown }>
  readonly subjectDelete: Subject<{ key: string; value: unknown }>
}

const DB_VERSION = 8;

const indexedDbFactory = (dbname: string, store = 'default'): KvPromise & IndexedDB => ({
  _db: null,
  subject: new Subject<{ key: string; value: unknown }>(),
  subjectDelete: new Subject<{ key: string; value: unknown }>(),
  get db(): Promise<IDBPDatabase> {
    // noinspection JSUnusedLocalSymbols
    return this._db === null ? openDB(dbname, DB_VERSION, {
      // eslint-disable-next-line no-unused-vars,@typescript-eslint/no-unused-vars
      upgrade(database: IDBPDatabase, oldVersion: number, newVersion: number | null, transaction) {
        log.debug('indexedDb upgrade');
        try {
          database.deleteObjectStore(store);
        } catch (e) {
          log.debug('indexedDb can not delete database', e);
        }
        try {
          database.createObjectStore(store, {});
        } catch (e) {
          log.error('indexedDb createObjectStore', e);
          throw (e);
        }
      },
      blocked() {
        log.debug('indexedDb blocked');
      },
      blocking() {
        log.debug('indexedDb blocking');
      },
      terminated() {
        log.debug('indexedDb terminated');
      },
    }).then(db => {
      log.debug('indexedDb init done');
      this._db = db;
      return db;
    }) : Promise.resolve(this._db);
  },
  get<T>(key: string, defaultValue: T, forcedJSON?: string): Promise<T> {
    if (forcedJSON) {
      return Promise.resolve<T>(JSON.parse(forcedJSON));
    }
    return this.db
      .then((db: IDBPDatabase) => db.get(store, key))
      .then((v?: T) =>
        v === undefined ? defaultValue : v as T)
      .catch((e: Error) => {
        log.error('indexedDB get', e);
        throw (e);
      });
  },
  set<T>(key: string, value: T) {
    log.debug(`indexedDb set ${key}`, value);
    const prom =
      (value === undefined)
        ? this.db.then((db: IDBPDatabase) => db.delete(store, key))
        : this.db.then((db: IDBPDatabase) => db.put(store, value, key));
    return prom.then(() => {
      this.subject.next({key, value});
    })
      .catch(err => {
        log.error(err);
        log.error({key, value});
      });
  },
  delete<T>(key: string): Promise<T | null> {
    return this.get<T | undefined>(key, undefined).then(existing => this.db.then((db: IDBPDatabase) => db.delete(store, key))
      .then(() => {
        const ret: T | null = existing === undefined ? null : existing as T;
        this.subject.next({key, value: ret});
        return ret;
      }));
  },
  observable<T>(key: string): Observable<T> {
    return this.subject.pipe(
      filter<{ key: string; value: unknown }>((r): boolean => r.key === key),
      map<{ key: string; value: unknown }, T>((r) => r.value as T),
    );
  },
  observableDelete<T>(key: string): Observable<T> {
    return this.subjectDelete.pipe(
      filter<{ key: string; value: unknown }>((r): boolean => r.key === key),
      map<{ key: string; value: unknown }, T>((r) => r.value as T),
    );
  },
});

export default indexedDbFactory;
