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
import {FeatureProps} from '../catalog';
import {RichText} from '../richtext';

export interface ImportedFolder {
  id?: string;
  features: FeatureProps[];
  folders: ImportedFolder[];
  name: string;
  description: RichText;
  open: boolean;
  visible: boolean;
  parent: ImportedFolder;
  level: number;
}

export interface ParsingStatus {
  queuedFiles: File[];
  parsingFile: File;
  rootFolder: ImportedFolder;
}

export interface Parser {
  // eslint-disable-next-line no-unused-vars
  parse: (fileList: FileList) => Promise<ImportedFolder>;
  status: ParsingStatus;
  statusObservable: () => Observable<ParsingStatus>;
  flatCategories: () => ImportedFolder;
  convertMixedToRoutes: () => ImportedFolder;
}
