import {Observable} from 'rxjs';
import log from '../../log';
import {useEffect, useState} from 'react';

const useObservable = <T>(observale: Observable<T>, initialValue: T, key?: string): T => {
  if (key) {
    log.rxUse(key);
  }
  const [state, setState] = useState<T>(initialValue);

  useEffect(() => {
    if (key) {
      log.rxAdd(key);
    }
    const subscription = observale.subscribe((value: T): void => {
      if (key) {
        log.rxSetState(key, value);
      }
      setState(value);
    });

    return (): void => {
      if (key) {
        log.rxDel(key);
      }
      subscription.unsubscribe();
    };
  }, [key, observale]);
  return state;
};

export default useObservable;

