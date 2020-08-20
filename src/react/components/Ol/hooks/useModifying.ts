import {Subject} from 'rxjs';
import useObservable from '../../../hooks/useObservable';

const subjectModifying = new Subject<boolean>();


export const setModifying = (over: boolean): void => subjectModifying.next(over);
export const useModifying = (): boolean => useObservable(subjectModifying, false);

