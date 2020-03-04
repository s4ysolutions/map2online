import {getLocalStorage} from '../../di-default';
import useObservable from './useObservable';

const localStorage = getLocalStorage();

const usePersistState = <T>(
  key: string,
  defaultVaule: T,
  forcedValue?: string
): T => useObservable(localStorage.observable<T>(key), localStorage.get(key, defaultVaule, forcedValue));

export default usePersistState;
