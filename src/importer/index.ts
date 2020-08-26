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
  parse: (fileList: FileList) => void;
  status: ParsingStatus;
  statusObservable: () => Observable<ParsingStatus>;
}

export const newImportedFolder = (level: number, parent: ImportedFolder | null): ImportedFolder => ({
  features: [],
  folders: [],
  name: '',
  description: '',
  level,
  parent,
});


/*
 *export const importAllToCategory = (folders: ImportedFolder[], category: Category): Promise<void> => {
 *  const foldersWithFeatures = flatImportedFolders(folders);
 *  return Promise.all(foldersWithFeatures.map(folder => category.routes.add({
 *    description: folder.description,
 *    id: makeId(),
 *    summary: '',
 *    title: folder.name,
 *    visible: true,
 *  }).then(route => Promise.all(folder.features.map(feature => route.features.add(feature)))))) as unknown as Promise<void>;
 *};
 *
 *export const importAllToCategories = async (folders: ImportedFolder[], catalog: Catalog): Promise<void> => {
 *  const foldersWithFeatures = flatImportedFolders(folders);
 *
 *  await Promise.all(foldersWithFeatures.map(folder => {
 *    if (!folder.parent.id) {
 *      const categoryProps: CategoryProps = {
 *        description: folder.description,
 *        id: makeId(),
 *        summary: '',
 *        title: folder.name,
 *        visible: true,
 *      };
 *      catalog.categories.add(categoryProps);
 *
 *      folder.parent.id = makeId();
 *      return catalog.categories.add(categoryProps);
 *    }
 *    return null;
 *
 *  }).filter(promise => Boolean(promise)));
 *
 *  return Promise.all(foldersWithFeatures.map(folder => {
 *    const category = catalog.categoryById(folder.parent.id);
 *    return category.routes.add({
 *      description: folder.description,
 *      id: makeId(),
 *      summary: '',
 *      title: folder.name,
 *      visible: true,
 *    }).then(route => Promise.all(folder.features.map(feature => route.features.add(feature))));
 *  })) as unknown as Promise<void>;
 *};
 */
