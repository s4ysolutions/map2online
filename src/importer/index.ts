import {Observable} from 'rxjs';
import {FeatureProps} from '../app-rx/catalog';

export interface ImportedFolder {
  id?: string;
  features: FeatureProps[];
  folders: ImportedFolder[];
  name: string;
  description: string;
  parent: ImportedFolder;
  level: number;
}

export interface ParsingStatus {
  queuedFiles: File[];
  parsingFile: File;
  rootFolder: ImportedFolder;
}

export interface Parser {
  parse: (fileList: FileList) => Promise<ImportedFolder>;
  status: ParsingStatus;
  statusObservable: () => Observable<ParsingStatus>;
  flatCategories: () => ImportedFolder;
  convertMixedToRoutes: () => ImportedFolder;
}
