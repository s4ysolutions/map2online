import {Observable} from 'rxjs';
import log from '../../log';
import {useEffect, useState} from 'react';

const useObservable = <T>(observale: Observable<T>, initialValue: T, key?: string): T => {
  log.debug(`use: Observable ${key ? key : 'no-key'}`);
  const [state, setState] = useState<T>(initialValue);
  if (key) {
    log.rxAdd(key);
  }
  const subscription = observale.subscribe((value: T): void => {
    setState(value);
  });

  useEffect(() => (): void => {
    if (key) {
      log.rxDel(key);
    }
    subscription.unsubscribe();
  });
  return state;
};

export default useObservable;

