import {Observable} from 'rxjs';

export interface ImportUI {
  visible: boolean;
  visibleObservable: () => Observable<boolean>;
  open: () => void;
  close: () => void;
}
