import {ImportedFolder, newImportedFolder} from './index';
import T from '../l10n';
import {getImportedFolderStats} from './stats';

export const CATEGORY_DEPTH = 2;

const filterEmptyFolders = (folders: ImportedFolder[]): ImportedFolder[] => {
  const nonemptyFolders: ImportedFolder[] = [];
  for (const folder of folders) {
    if (folder.features.length > 0) {
      // this folder is a Route
      nonemptyFolders.push(folder);
    } else if (folder.folders.length > 0) {
      // this folder can be a Category
      const nonEmptySubfolders = filterEmptyFolders(folder.folders);
      if (nonEmptySubfolders.length > 0) {
        // a categroy must have at least one non-empty subfolder
        folder.folders = nonEmptySubfolders;
        nonemptyFolders.push(folder);
      }
    }
  }
  return nonemptyFolders;
};

export const removeEmptyImportedFolders = (rootFolder: ImportedFolder): ImportedFolder => {
  const {folders} = rootFolder;
  rootFolder.folders = filterEmptyFolders(folders);
  return rootFolder;
};

export const converMixedFeaturesToFolder = (rootFolder: ImportedFolder, level?: number): ImportedFolder => {
  const l = level === undefined ? 0 : level;
  const foldersWithoutMixes: ImportedFolder[] = [];
  if (rootFolder.features.length > 0 && rootFolder.folders.length > 0) {
    const folderForFeatures = newImportedFolder(l, rootFolder);
    folderForFeatures.name = rootFolder.name + T`(auto)`;
    folderForFeatures.features = rootFolder.features;
    rootFolder.features = [];
    foldersWithoutMixes.push(folderForFeatures);
  }
  for (const folder of rootFolder.folders) {
    foldersWithoutMixes.push(converMixedFeaturesToFolder(folder, l + 1));
  }
  rootFolder.folders = foldersWithoutMixes;
  return rootFolder;
};

export const flatImportedFoldersToCategories = (rootFolder: ImportedFolder, enterl?: number): ImportedFolder => {
  const {depth} = getImportedFolderStats(rootFolder);
  // console.log(`enter ${enterl || 0} levels=${levels}`, rootFolder);
  if (depth <= CATEGORY_DEPTH) {
    // console.log('exit category');
    return rootFolder;
  }
  const flatFolders: ImportedFolder[] = [];
  for (const folder of rootFolder.folders) {
    const flat = flatImportedFoldersToCategories(folder, (enterl || 0) + 1);
    if (flat.folders.length > 0) {
      for (const f of flatImportedFoldersToCategories(folder, (enterl || 0) + 1).folders) {
        flatFolders.push(f);
      }
    } else {
      flatFolders.push(flat);
    }
  }
  // console.log('exit enterl=', enterl || 0, flatFolders);
  rootFolder.folders = flatFolders;
  return rootFolder;
};
