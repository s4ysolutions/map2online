import {Subject} from 'rxjs';
import useObservable from '../../../hooks/useObservable';

const subjectCursorOver = new Subject<boolean>()


export const setCursorOver = (over: boolean) => subjectCursorOver.next(over)
export const useCursorOver = (): boolean => useObservable(subjectCursorOver, false)

