/* eslint-disable no-console */
import {Subject} from 'rxjs';

const log = {
  d: console.debug,
  debug: console.debug,
  error: console.error,
  info: console.info,
  warn: console.warn,
  render(component: string, params?: object): void {
    if (params) {
      this.debug(`render: ${component}`, params);
    } else {
      this.debug(`render: ${component}`);
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

export const _ = <T>(o: T, description?: any): T => {
  if (description)
    log.d(description, o);
  else
    log.d(o);
  return o;
};
