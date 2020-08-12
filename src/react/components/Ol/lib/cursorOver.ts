import {Subject} from 'rxjs';

export const subjectCursorOver = new Subject()
/*
const nextCursorOverState = (over: boolean) => subjectCursorOver.next(over)

const cursorOver = ():[boolean, (over: boolean) => void] => [useObservable(subjectCursorOver, false), nextCursorOverState]

export default cursorOver;
 */
