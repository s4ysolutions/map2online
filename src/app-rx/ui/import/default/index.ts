import {ImportUI} from '../index';
import {Subject} from 'rxjs';

export const importUIFactory = (): ImportUI => {
  let visible = false;
  const visibleSubject = new Subject<boolean>();
  const th: ImportUI = {
    close() {
      this.visible = false;
    },
    open() {
      this.visible = true;
    },
    get visible() {
      return visible;
    },
    set visible(value) {
      visible = value;
      visibleSubject.next(visible);
    },
    visibleObservable: () => visibleSubject,
  };
  th.close = th.close.bind(th);
  th.open = th.open.bind(th);
  return th;
};
