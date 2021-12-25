/*
 * Copyright 2019 s4y.solutions
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {Workspace} from './index';
import {KV} from '../../kv/sync';
import {Subject} from 'rxjs';

const workspaceFactory = (persistanceStorage: KV): Workspace => {
  const aboutObservable = new Subject<boolean>();
  const filesObservable = new Subject<boolean>();
  const exportObservable = new Subject<boolean>();
  const sourcesObservable = new Subject<boolean>();
  const settingsObservable = new Subject<boolean>();
  const personalizationObservable = new Subject<boolean>();

  const th: Workspace & { closeAbout: () => void; closeExport: () => void; closeFile: () => void; closeSources: () => void; closeSettings: () => void } = {
    aboutObservable: () => persistanceStorage.observable('a'),
    aboutOpen: false,
    catalogObservable: () => persistanceStorage.observable('cato'),
    catalogOpen: persistanceStorage.get('cato', false),
    toolsObservable: () => persistanceStorage.observable('feo'),
    toolsOpen: persistanceStorage.get('feo', true),
    fileObservable: () => filesObservable,
    fileOpen: false,
    exportObservable: () => exportObservable,
    exportOpen: false,
    sourcesObservable: () => sourcesObservable,
    sourcesOpen: false,
    settingsObservable: () => settingsObservable,
    settingsOpen: false,
    personalizationObservable: () => personalizationObservable,
    personalizationOpen: false,
    toggleAbout () {
      this.closeFile();
      this.closeExport();
      this.closeSources();
      this.closeSettings();
      const value = !this.aboutOpen;
      persistanceStorage.set('a', value);
      this.aboutOpen = value;
    },
    toggleCatalog () {
      const value = !this.catalogOpen;
      persistanceStorage.set('cato', value);
      this.catalogOpen = value;
    },
    toggleTools () {
      this.closeMenus();
      const value = !this.toolsOpen;
      persistanceStorage.set('feo', value);
      this.toolsOpen = value;
    },
    toggleExport () {
      this.closeAbout();
      this.closeFile();
      this.closeSources();
      this.closeSettings();
      const value = !this.exportOpen;
      exportObservable.next(value);
      this.exportOpen = value;
    },
    toggleFile () {
      this.closeAbout();
      this.closeExport();
      this.closeSources();
      this.closeSettings();
      const value = !this.fileOpen;
      filesObservable.next(value);
      this.fileOpen = value;
    },
    toggleSources () {
      this.closeAbout();
      this.closeFile();
      this.closeExport();
      this.closeSettings();
      const value = !this.sourcesOpen;
      sourcesObservable.next(value);
      this.sourcesOpen = value;
    },
    toggleSettings () {
      this.closeAbout();
      this.closeFile();
      this.closeExport();
      this.closeSources();
      const value = !this.settingsOpen;
      settingsObservable.next(value);
      this.settingsOpen = value;
    },
    togglePersonalization () {
      this.closeMenus();
      const value = !this.personalizationOpen;
      personalizationObservable.next(value);
      this.personalizationOpen = value;
    },
    closeAbout () {
      aboutObservable.next(false);
      this.aboutOpen = false;
    },
    closeExport () {
      exportObservable.next(false);
      this.exportOpen = false;
    },
    closeFile () {
      filesObservable.next(false);
      this.fileOpen = false;
    },
    closeSources () {
      sourcesObservable.next(false);
      this.sourcesOpen = false;
    },
    closeSettings () {
      settingsObservable.next(false);
      this.settingsOpen = false;
    },
    closeMenus () {
      this.closeFile();
      this.closeExport();
      this.closeSources();
      this.closeSettings();
    },
  };
  th.toggleAbout = th.toggleAbout.bind(th);
  th.toggleCatalog = th.toggleCatalog.bind(th);
  th.toggleTools = th.toggleTools.bind(th);
  th.toggleFile = th.toggleFile.bind(th);
  th.toggleExport = th.toggleExport.bind(th);
  th.toggleSources = th.toggleSources.bind(th);
  th.toggleSettings = th.toggleSettings.bind(th);
  th.togglePersonalization = th.togglePersonalization.bind(th);
  return th;
};

export default workspaceFactory;
