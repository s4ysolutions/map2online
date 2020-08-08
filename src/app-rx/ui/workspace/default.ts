import {Workspace} from './index';
import {KV} from '../../../kv-rx';
import {Subject} from 'rxjs';

const filesObservable = new Subject<boolean>();
const sourcesObservable = new Subject<boolean>();
const settingsObservable = new Subject<boolean>();
const personalizationObservable = new Subject<boolean>();

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
    settingsObservable: () => settingsObservable,
    settingsOpen: false,
    personalizationObservable: () => personalizationObservable,
    personalizationOpen: false,
    toggleCatalog: function () {
      const value = !this.catalogOpen;
      persistanceStorage.set('cato', value);
      this.catalogOpen = value;
    },
    toggleTools: function () {
      this.closeMenus()
      const value = !this.toolsOpen;
      persistanceStorage.set('feo', value);
      this.toolsOpen = value;
    },
    toggleFile: function () {
      this.closeMenus()
      const value = !this.fileOpen;
      filesObservable.next(value);
      this.fileOpen = value;
    },
    toggleSources: function () {
      this.closeMenus()
      const value = !this.sourcesOpen;
      sourcesObservable.next(value);
      this.sourcesOpen = value;
    },
    toggleSettings: function () {
      this.closeMenus()
      const value = !this.settingsOpen;
      settingsObservable.next(value);
      this.settingsOpen = value;
    },
    togglePersonalization: function () {
      this.closeMenus()
      const value = !this.personalizationOpen;
      personalizationObservable.next(value);
      this.personalizationOpen = value;
    },
    closeMenus: function () {
      filesObservable.next(false);
      this.fileOpen = false;
      settingsObservable.next(false);
      this.settingsOpen = false;
      sourcesObservable.next(false);
      this.sourcesOpen = false;
    },
  };
  th.toggleCatalog = th.toggleCatalog.bind(th);
  th.toggleTools = th.toggleTools.bind(th);
  th.toggleFile = th.toggleFile.bind(th);
  th.toggleSources = th.toggleSources.bind(th);
  th.toggleSettings = th.toggleSettings.bind(th);
  th.togglePersonalization = th.togglePersonalization.bind(th);
  return th;
};

export default workspaceFactory;