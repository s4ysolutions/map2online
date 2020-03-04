import {KV} from './index';
import {Subject} from 'rxjs';
import {persistedLocal} from '../persist/local';
import {filter, map} from 'rxjs/operators';

interface LocalStorage {
  subject: Subject<Record<string, any>>;
}

const localStorageSingleton: KV & LocalStorage = {
  get: function <T>(key: string, defaultValue: T, forcedJSON?: string) {
    if (forcedJSON) {
      return JSON.parse(forcedJSON);
    }
    const serialized = window.localStorage.getItem(key);
    return serialized ? JSON.parse(serialized) : defaultValue;
  },
  subject: new Subject<Record<string, any>>(),
  set: function <T>(key: string, value: T) {
    if (value === undefined) {
      window.localStorage.removeItem(key);
    } else {
      const valueToStore = value instanceof Function ? value(persistedLocal(key, value)) : value;
      window.localStorage.setItem(
        key,
        JSON.stringify(valueToStore)
      );
      this.subject.next({[key]: value})
    }
  },
  observable: function <T>(key: string) {
    return this.subject.pipe(
      filter(r => r[key] !== undefined),
      map(r => r[key])
    );
  },
};

export default localStorageSingleton;
