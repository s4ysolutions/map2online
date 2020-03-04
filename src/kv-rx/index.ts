import {Observable} from 'rxjs';

export interface KV {
  get: <T>(key: string, def: T, forcedJSON?: string) => T;
  set: <T>(key: string, value: T) => void;
  observable: <T>(key: string) => Observable<T>;
}

