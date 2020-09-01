import {Observable} from 'rxjs';
import {ImportTo} from '../../../importer/import-to';

export interface ImportUI {
  visible: boolean;
  visibleObservable: () => Observable<boolean>;
  open: () => void;
  close: () => void;
  importTo: ImportTo;
  importToObservable: () => Observable<ImportTo>;
}
