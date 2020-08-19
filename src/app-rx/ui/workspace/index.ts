import {Observable} from 'rxjs';

export interface Workspace {
  readonly aboutOpen: boolean;
  readonly catalogOpen: boolean;
  readonly fileOpen: boolean;
  readonly personalizationOpen: boolean;
  readonly toolsOpen: boolean;
  readonly settingsOpen: boolean;
  readonly sourcesOpen: boolean;

  aboutObservable: () => Observable<boolean>;
  catalogObservable: () => Observable<boolean>;
  fileObservable: () => Observable<boolean>;
  personalizationObservable: () => Observable<boolean>;
  settingsObservable: () => Observable<boolean>;
  sourcesObservable: () => Observable<boolean>;
  toolsObservable: () => Observable<boolean>;

  toggleAbout: () => void;
  toggleCatalog: () => void;
  toggleFile: () => void;
  togglePersonalization: () => void;
  toggleSettings: () => void;
  toggleSources: () => void;
  toggleTools: () => void;

  closeMenus: () => void
}

