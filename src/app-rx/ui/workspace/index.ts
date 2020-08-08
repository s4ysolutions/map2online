import {Observable} from 'rxjs';

export interface Workspace {
  readonly catalogOpen: boolean;
  readonly fileOpen: boolean;
  readonly toolsOpen: boolean;
  readonly sourcesOpen: boolean;
  readonly settingsOpen: boolean;
  readonly personalizationOpen: boolean;

  catalogObservable: () => Observable<boolean>;
  fileObservable: () => Observable<boolean>;
  toolsObservable: () => Observable<boolean>;
  sourcesObservable: () => Observable<boolean>;
  settingsObservable: () => Observable<boolean>;
  personalizationObservable: () => Observable<boolean>;

  toggleCatalog: () => void;
  toggleFile: () => void;
  toggleTools: () => void;
  toggleSources: () => void;
  toggleSettings: () => void;
  togglePersonalization: () => void;
}

