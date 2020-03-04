import {Workspace} from './index';
import {KV} from '../../../kv-rx';
import {Subject} from 'rxjs';

const filesObservable = new Subject<boolean>();
const sourcesObservable = new Subject<boolean>();

const workspaceFactory = (persistanceStorage: KV): Workspace => {
  const th: Workspace = {
    catalogObservable: () => persistanceStorage.observable('cato'),
    catalogOpen: persistanceStorage.get('cato', false),
    toolsObservable: () => persistanceStorage.observable('feo'),
    toolsOpen: persistanceStorage.get('feo', true),
    fileObservable: () => filesObservable,
    fileOpen: false,
    sourcesObservable: () => sourcesObservable,
    sourcesOpen: false,
    toggleCatalog: function () {
      const value = !this.catalogOpen;
      persistanceStorage.set('cato', value);
      this.catalogOpen = value;
    },
    toggleTools: function () {
      const value = !this.toolsOpen;
      persistanceStorage.set('feo', value);
      this.toolsOpen = value;
    },
    toggleFile: function () {
      const value = !this.fileOpen;
      filesObservable.next(value);
      this.fileOpen = value;
    },
    toggleSources: function () {
      const value = !this.sourcesOpen;
      sourcesObservable.next(value);
      this.sourcesOpen = value;
    }
  };
  th.toggleCatalog = th.toggleCatalog.bind(th);
  th.toggleTools = th.toggleTools.bind(th);
  th.toggleFile = th.toggleFile.bind(th);
  th.toggleSources = th.toggleSources.bind(th);
  return th;
};

export default workspaceFactory;

