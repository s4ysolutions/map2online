import {KV} from '../../../src/kv-rx';
import {Subject} from 'rxjs';
import {filter, map} from 'rxjs/operators';

const memoryStorageFactory = (): KV => {
  const subject = new Subject<{ key: string, value: any }>();
  const mem = {}
  return {
    get: function <T>(key: string, defaultValue: T, forcedJSON?: string) {
      if (forcedJSON) {
        return JSON.parse(forcedJSON);
      }
      const serialized = mem[key];
      return serialized ? JSON.parse(serialized) : defaultValue;
    },
    set: function <T>(key: string, value: T) {
      if (value === undefined) {
        delete (mem[key]);
      } else {
        const valueToStore = value instanceof Function ? value(this.get(key)) : value;
        const json = JSON.stringify(valueToStore)
        mem[key] = json;
      }
      subject.next({key, value})
    },
    delete: function <T>(key: string) {
      delete (mem[key]);
      subject.next({key, value: null})
    },
    observable: function <T>(key?: string) {
      return key
        ? subject.pipe(
          filter<{ key: string; value: any }>((r): boolean => r.key === key),
          map<{ key: string; value: any }, any>((r) => r.value)
        )
        : subject;
    },
  }
};

export default memoryStorageFactory;
