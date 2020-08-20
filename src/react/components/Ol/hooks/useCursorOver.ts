import {Subject} from 'rxjs';
import useObservable from '../../../hooks/useObservable';

const subjectCursorOver = new Subject<boolean>();

export const setCursorOver = (over: boolean): void => subjectCursorOver.next(over);
export const useCursorOver = (): boolean => useObservable(subjectCursorOver, false);

