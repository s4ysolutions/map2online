import {ImportUI} from '../index';
import {Subject} from 'rxjs';
import {ImportTo} from '../../../../importer/import-to';
import {KV} from '../../../../kv-rx';

export const importUIFactory = (storage: KV): ImportUI => {
  let visible = false;
  const visibleSubject = new Subject<boolean>();
  const th: ImportUI = {
    get importTo() {
      return storage.get('impto', ImportTo.ALL_CATEGORIES_TO_CATALOG);
    },
    set importTo(value) {
      storage.set('impto', value);
    },
    importToObservable: () => storage.observable<ImportTo>('impto'),
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
