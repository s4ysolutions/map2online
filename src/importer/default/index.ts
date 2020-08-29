import {ImportedFolder, Parser, ParsingStatus} from '../index';
import {kmlParserFactory} from './kml-parser';
import {Observable, Subject, merge} from 'rxjs';
import {
  CATEGORY_DEPTH, convertMixedFeaturesToFolder, flatImportedFoldersToCategories,
  removeEmptyImportedFolders, removeTopFolder,
} from '../post-process';
import {getImportedFolderStats} from '../stats';

export const parserFactory = (): Parser => {
  const subject = new Subject<ParsingStatus>();
  const kmlParser = kmlParserFactory();
  return {
    parse: (fileList: FileList): Promise<ImportedFolder> =>
      kmlParser.parse(fileList).then(importedFolder => {
        let folder = removeEmptyImportedFolders(importedFolder);
        for (; ;) {
          const stats = getImportedFolderStats(folder);
          if (stats.depth < CATEGORY_DEPTH || folder.folders.length !== 1 || folder.features.length !== 0) {
            break;
          }
          // skip Document
          folder = removeTopFolder(folder);
        }
        kmlParser.status.rootFolder = folder;
        subject.next({...kmlParser.status});
        return folder;
      }),
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
