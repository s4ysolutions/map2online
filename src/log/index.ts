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
