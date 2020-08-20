import {Observable} from 'rxjs';
import {Catalog, Category, CategoryProps, FeatureProps} from '../app-rx/catalog';
import {makeId} from '../lib/id';

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
  importedFolders: ImportedFolder[];
}

export interface Parser {
  parse: (fileList: FileList) => void;
  status: ParsingStatus;
  statusObservable: () => Observable<ParsingStatus>;
}

export const flatImportedFolders = (importedFolders: ImportedFolder[]): ImportedFolder[] => {
  let ret: ImportedFolder[] = [];
  for (const folder of importedFolders) {
    if (folder.features.length > 0) {
      ret.push(folder);
    }
    if (folder.folders.length > 0) {
      const subFolders = flatImportedFolders(folder.folders);
      ret = ret.concat(subFolders);
    }
  }
  return ret;
};

export const importAllToCategory = (folders: ImportedFolder[], category: Category): Promise<void> => {
  const foldersWithFeatures = flatImportedFolders(folders);
  return Promise.all(foldersWithFeatures.map(folder => category.routes.add({
    description: folder.description,
    id: makeId(),
    summary: '',
    title: folder.name,
    visible: true,
  }).then(route => Promise.all(folder.features.map(feature => route.features.add(feature)))))) as unknown as Promise<void>;
};

export const importAllToCategories = async (folders: ImportedFolder[], catalog: Catalog): Promise<void> => {
  const foldersWithFeatures = flatImportedFolders(folders);

  await Promise.all(foldersWithFeatures.map(folder => {
    if (!folder.parent.id) {
      const categoryProps: CategoryProps = {
        description: folder.description,
        id: makeId(),
        summary: '',
        title: folder.name,
        visible: true,
      };
      catalog.categories.add(categoryProps);

      folder.parent.id = makeId();
      return catalog.categories.add(categoryProps);
    }
    return null;

  }).filter(promise => Boolean(promise)));

  return Promise.all(foldersWithFeatures.map(folder => {
    const category = catalog.categoryById(folder.parent.id);
    return category.routes.add({
      description: folder.description,
      id: makeId(),
      summary: '',
      title: folder.name,
      visible: true,
    }).then(route => Promise.all(folder.features.map(feature => route.features.add(feature))));
  })) as unknown as Promise<void>;
};

