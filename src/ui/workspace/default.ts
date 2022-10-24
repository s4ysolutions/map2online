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
  const filesObservable = new Subject<boolean>();
  const exportObservable = new Subject<boolean>();
  const sourcesObservable = new Subject<boolean>();
  const settingsObservable = new Subject<boolean>();
  const personalizationObservable = new Subject<boolean>();
  let exportOpen = false;
  let fileOpen = false;
  let sourcesOpen = false;
  let settingsOpen = false;
  let personalizationOpen = false;

  const th: Workspace & { closeAbout: () => void; closeExport: () => void; closeFile: () => void; closeSources: () => void; closeSettings: () => void } = {
    aboutObservable: () => persistanceStorage.observable('a'),
    get aboutOpen() {
      return persistanceStorage.get('a', false);
    },
    catalogObservable: () => persistanceStorage.observable('cato'),
    get catalogOpen() {
      return persistanceStorage.get('cato', false);
    },
    toolsObservable: () => persistanceStorage.observable('feo'),
    get toolsOpen() {
      return persistanceStorage.get('feo', true);
    },
    fileObservable: () => filesObservable,
    get fileOpen() {
      return fileOpen;
    },
    exportObservable: () => exportObservable,
    get exportOpen() {
      return exportOpen;
    },
    sourcesObservable: () => sourcesObservable,
    get sourcesOpen() {
      return sourcesOpen;
    },
    settingsObservable: () => settingsObservable,
    get settingsOpen() {
      return settingsOpen;
    },
    personalizationObservable: () => personalizationObservable,
    get personalizationOpen() {
      return personalizationOpen;
    },
    toggleAbout() {
      this.closeFile();
      this.closeExport();
      this.closeSources();
      this.closeSettings();
      const value = !this.aboutOpen;
      persistanceStorage.set('a', value);
    },
    toggleCatalog() {
      const value = !this.catalogOpen;
      persistanceStorage.set('cato', value);
    },
    toggleTools() {
      this.closeMenus();
      const value = !this.toolsOpen;
      persistanceStorage.set('feo', value);
    },
    toggleExport() {
      this.closeAbout();
      this.closeFile();
      this.closeSources();
      this.closeSettings();
      const value = !this.exportOpen;
      exportOpen = value;
      exportObservable.next(value);
    },
    toggleFile() {
      this.closeAbout();
      this.closeExport();
      this.closeSources();
      this.closeSettings();
      const value = !this.fileOpen;
      fileOpen = value;
      filesObservable.next(value);
    },
    toggleSources() {
      this.closeAbout();
      this.closeFile();
      this.closeExport();
      this.closeSettings();
      const value = !this.sourcesOpen;
      sourcesOpen = value;
      sourcesObservable.next(value);
    },
    toggleSettings() {
      this.closeAbout();
      this.closeFile();
      this.closeExport();
      this.closeSources();
      const value = !this.settingsOpen;
      settingsOpen = value;
      settingsObservable.next(value);
    },
    togglePersonalization() {
      this.closeMenus();
      const value = !this.personalizationOpen;
      personalizationOpen = value;
      personalizationObservable.next(value);
    },
    closeAbout() {
      persistanceStorage.set('a', false);
    },
    closeExport() {
      exportOpen = false;
      exportObservable.next(false);
    },
    closeFile() {
      fileOpen = false;
      filesObservable.next(false);
    },
    closeSources() {
      sourcesOpen = false;
      sourcesObservable.next(false);
    },
    closeSettings() {
      settingsOpen = false;
      settingsObservable.next(false);
    },
    closeMenus() {
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
