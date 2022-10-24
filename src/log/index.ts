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

/* eslint-disable no-console */
import {Subject} from 'rxjs';

console.debug = (): void => undefined;

let prevTS = 0;
const MS = 1000;
const SIXTY = 60;

const log = {
  /*
   * d: (a?: any, b?: any, c?: any) => undefined, //console.debug,
   * debug: (a?: any, b?: any, c?: any) => undefined, //console.debug,
   */
  d: console.debug,
  debug: console.log,
  error: console.error,
  info: console.info,
  warn: console.warn,
  ts(message: string, params?: unknown): void {
    const ts = Date.now();
    if (prevTS > 0) {
      const d = ts - prevTS;
      if (d < MS) {
        if (params === undefined) {
          console.log(`ts: 0:0.${d} ${message}`);
        } else {
          console.log(`ts: 0:0.${d} ${message}`, params);
        }
      } else {
        const sec = Math.trunc((d / MS) % SIXTY);
        const min = Math.trunc((d / MS) / SIXTY);
        if (params === undefined) {
          console.log(`ts: ${min}:${sec}.${d % MS} ${message}`);
        } else {
          console.log(`ts: ${min}:${sec}.${d % MS} ${message}`, params);
        }
      }
    } else if (params === undefined) {
      console.log(`ts: 0 ${message}`);
    } else {
      console.log(`ts: 0 ${message}`, params);
    }
    prevTS = ts;
  },
  render(component: string, params?: unknown): void {
    if (params) {
      this.debug(`render: ${component}`, params);
    } else {
      this.debug(`render: ${component}`);
    }
  },
  rxUse(id: string): void {
    this.debug(`rx: use ${id}`);
  },
  rxSetState(id: string, value?: unknown): void {
    if (value === undefined) {
      this.debug(`rx: ${id} setState`);
    } else {
      this.debug(`rx: ${id} setState(${value})`);
    }
  },
  rxAdd(id: string): void {
    if (!this.rxCounters[id]) {
      this.rxCounters[id] = 0;
    }
    this.rxCounters[id]++;
    this.debug(`rx: ${id} = ${this.rxCounters[id]} +`);
  },
  rxAddSubject<T>(id: string, subject: Subject<T>): void {
    this.debug(`rx: ${id} = ${subject.observers.length} +`);
  },
  rxCounters: {} as Record<string, number>,
  rxDel(id: string): void {
    if (!this.rxCounters[id]) {
      this.rxCounters[id] = 0;
    }
    this.rxCounters[id]--;
    if (this.rxCounters[id] < 0) {
      this.error(`rx: ${id} = ${this.rxCounters[id]} -`);
    } else {
      this.debug(`rx: ${id} = ${this.rxCounters[id]} -`);
    }
  },
  rxDelSubject<T>(id: string, subject: Subject<T>): void {
    this.debug(`rx: ${id} = ${subject.observers.length} -`);
  },
  disableDebug() {
    this.d = (): void => undefined;
    this.debug = (): void => undefined;
  },
};

export default log;
