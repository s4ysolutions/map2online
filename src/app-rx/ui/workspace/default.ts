import {Workspace} from './index';
import {KV} from '../../../kv-rx';
import {Subject} from 'rxjs';

const workspaceFactory = (persistanceStorage: KV): Workspace => {
  const aboutObservable = new Subject<boolean>();
  const filesObservable = new Subject<boolean>();
  const sourcesObservable = new Subject<boolean>();
  const settingsObservable = new Subject<boolean>();
  const personalizationObservable = new Subject<boolean>();

  const th: Workspace & { closeAbout: () => void; closeFile: () => void; closeSources: () => void; closeSettings: () => void } = {
    aboutObservable: () => persistanceStorage.observable('a'),
    aboutOpen: false,
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
    toggleAbout: function () {
      this.closeFile()
      this.closeSources()
      this.closeSettings()
      const value = !this.aboutOpen;
      persistanceStorage.set('a', value);
      this.catalogOpen = value;
    },
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
      this.closeAbout()
      this.closeSources()
      this.closeSettings()
      const value = !this.fileOpen;
      filesObservable.next(value);
      this.fileOpen = value;
    },
    toggleSources: function () {
      this.closeAbout()
      this.closeFile()
      this.closeSettings()
      const value = !this.sourcesOpen;
      sourcesObservable.next(value);
      this.sourcesOpen = value;
    },
    toggleSettings: function () {
      this.closeAbout()
      this.closeFile()
      this.closeSources()
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
    closeAbout: function () {
      aboutObservable.next(false);
      this.aboutOpen = false;
    },
    closeFile: function () {
      filesObservable.next(false);
      this.fileOpen = false;
    },
    closeSources: function () {
      sourcesObservable.next(false);
      this.sourcesOpen = false;
    },
    closeSettings: function () {
      settingsObservable.next(false);
      this.settingsOpen = false;
    },
    closeMenus: function () {
      this.closeFile()
      this.closeSources()
      this.closeSettings()
    },
  };
  th.toggleAbout = th.toggleAbout.bind(th);
  th.toggleCatalog = th.toggleCatalog.bind(th);
  th.toggleTools = th.toggleTools.bind(th);
  th.toggleFile = th.toggleFile.bind(th);
  th.toggleSources = th.toggleSources.bind(th);
  th.toggleSettings = th.toggleSettings.bind(th);
  th.togglePersonalization = th.togglePersonalization.bind(th);
  return th;
};

export default workspaceFactory;