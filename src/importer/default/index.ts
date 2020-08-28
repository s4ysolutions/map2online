import {ImportedFolder, Parser, ParsingStatus } from '../index';
import {kmlParserFactory} from './kml-parser';
import {Observable, Subject, merge} from 'rxjs';
import {
  CATEGORY_DEPTH,
  removeEmptyImportedFolders,
} from '../post-process';
import {getImportedFolderStats} from '../stats';

const decrementLevels = (root: ImportedFolder, prev: ImportedFolder): void => {
  root.level -= 1;
  if (!root.name) {
    root.name = prev.name;
  }
  if (!root.description) {
    root.description = prev.description;
  }
  for (const f of root.folders) {
    decrementLevels(f, root);
  }
};

const removeTopFolder = (root: ImportedFolder): ImportedFolder => {
  const [r] = root.folders;
  r.parent = null;
  decrementLevels(r, root);
  return r;
};

export const parserFactory = (): Parser => {
  const subject = new Subject<ParsingStatus>();
  const kmlParser = kmlParserFactory();
  return {
    parse: (fileList: FileList): Promise<ImportedFolder> =>
      kmlParser.parse(fileList).then(importedFolder => {
        let folder = removeEmptyImportedFolders(importedFolder);
        for (; ;) {
          const stats = getImportedFolderStats(folder);
          console.log('debug reduce?', {
            break: stats.depth < CATEGORY_DEPTH || folder.folders.length !== 1 || folder.features.length !== 0,
            depth: stats.depth,
            folder,
          });
          if (stats.depth < CATEGORY_DEPTH || folder.folders.length !== 1 || folder.features.length !== 0) {
            break;
          }
          // skip Document
          console.log('debug will reduce');
          folder = removeTopFolder(folder);
          console.log('debug reduced', folder);
        }
        subject.next({...kmlParser.status, rootFolder: folder});
        return folder;
      }),
    get status(): ParsingStatus {
      return kmlParser.status;
    },
    statusObservable(): Observable<ParsingStatus> {
      return merge(kmlParser.statusObservable(), subject);
    },
  };
};
