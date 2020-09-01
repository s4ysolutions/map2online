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

if (!process.env.DEBUG) {
  console.debug = ():void => undefined;
}

const log = {
  /*
   * d: (a?: any, b?: any, c?: any) => undefined, //console.debug,
   * debug: (a?: any, b?: any, c?: any) => undefined, //console.debug,
   */
  d: console.debug,
  debug: console.debug,
  error: console.error,
  info: console.info,
  warn: console.warn,
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
  rxCounters: {},
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
};

export default log;
