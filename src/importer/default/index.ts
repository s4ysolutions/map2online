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

import {ImportedFolder, Parser, ParsingStatus} from '../index';
import {kmlParserFactory} from './kml-parser';
import {Observable, Subject, merge} from 'rxjs';
import {
  CATEGORY_DEPTH, convertMixedFeaturesToFolder, flatImportedFoldersToCategories,
  removeEmptyImportedFolders,
} from '../post-process';
import {getImportedFolderStats} from '../stats';
import {Map2Styles} from '../../style';

export const parserFactory = (map2styles: Map2Styles): Parser => {
  const subject = new Subject<ParsingStatus>();
  const kmlParser = kmlParserFactory(map2styles);
  return {
    parse (fileList: FileList): Promise<ImportedFolder> {
      return kmlParser.parse(fileList).then(importedFolder => {
        kmlParser.status.rootFolder = removeEmptyImportedFolders(importedFolder);
        subject.next({...kmlParser.status});
        for (; ;) {
          const folder = kmlParser.status.rootFolder;
          const stats = getImportedFolderStats(folder);
          if (stats.depth < CATEGORY_DEPTH || folder.folders.length !== 1 || folder.features.length !== 0) {
            break;
          }
          /*
           * skip Document
           */
          this.flatCategories();
        }
        return kmlParser.status.rootFolder;
      });
    },
    get status(): ParsingStatus {
      return kmlParser.status;
    },
    statusObservable(): Observable<ParsingStatus> {
      return merge(kmlParser.statusObservable(), subject);
    },
    flatCategories: (): ImportedFolder => {
      kmlParser.status.rootFolder = flatImportedFoldersToCategories(kmlParser.status.rootFolder);
      subject.next({...kmlParser.status});
      return kmlParser.status.rootFolder;
    },
    convertMixedToRoutes: (): ImportedFolder => {
      kmlParser.status.rootFolder = convertMixedFeaturesToFolder(kmlParser.status.rootFolder);
      subject.next({...kmlParser.status});
      return kmlParser.status.rootFolder;
    },
  };
};
