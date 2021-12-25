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

import {Observable} from 'rxjs';

export interface Workspace {
  readonly aboutOpen: boolean;
  readonly catalogOpen: boolean;
  readonly fileOpen: boolean;
  readonly exportOpen: boolean;
  readonly personalizationOpen: boolean;
  readonly toolsOpen: boolean;
  readonly settingsOpen: boolean;
  readonly sourcesOpen: boolean;

  aboutObservable: () => Observable<boolean>;
  catalogObservable: () => Observable<boolean>;
  fileObservable: () => Observable<boolean>;
  exportObservable: () => Observable<boolean>;
  personalizationObservable: () => Observable<boolean>;
  settingsObservable: () => Observable<boolean>;
  sourcesObservable: () => Observable<boolean>;
  toolsObservable: () => Observable<boolean>;

  toggleAbout: () => void;
  toggleCatalog: () => void;
  toggleFile: () => void;
  toggleExport: () => void;
  togglePersonalization: () => void;
  toggleSettings: () => void;
  toggleSources: () => void;
  toggleTools: () => void;

  closeMenus: () => void
}

