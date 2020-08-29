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

export const convertMixedFeaturesToFolder = (rootFolder: ImportedFolder, level?: number): ImportedFolder => {
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
    foldersWithoutMixes.push(convertMixedFeaturesToFolder(folder, l + 1));
  }
  rootFolder.folders = foldersWithoutMixes;
  return rootFolder;
};

const isRoute = (folder: ImportedFolder): boolean => folder.folders.length === 0;

const isCategory = (folder: ImportedFolder): boolean => {
  for (const sf of folder.folders) {
    if (!isRoute(sf)) {
      return false;
    }
  }
  return folder.folders.length > 0;
};

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

export const removeTopFolder = (root: ImportedFolder): ImportedFolder => {
  const [r] = root.folders;
  r.parent = null;
  decrementLevels(r, root);
  return r;
};

const flatImportedFoldersToCategoriesRecursive = (rootFolder: ImportedFolder): ImportedFolder[] => {
  // TODO: fix level
  let categoryFolders: ImportedFolder[] = [];

  // console.log('enter', rootFolder);
  const routesFolder: ImportedFolder[] = [];
  for (const folder of rootFolder.folders) {
    if (isRoute(folder)) {
      routesFolder.push(folder);
    }
  }

  if (routesFolder.length > 0) {
    categoryFolders.push({...rootFolder, folders: routesFolder});
  }
  // console.log('routes', categoryFolders);

  for (const folder of rootFolder.folders) {
    if (isCategory(folder)) {
      //   console.log('push', folder);
      categoryFolders.push(folder);
    }
  }

  for (const folder of rootFolder.folders) {
    if (!isRoute(folder) && !isCategory(folder)) {
      categoryFolders = categoryFolders.concat(flatImportedFoldersToCategoriesRecursive(folder));
    }
  }

  // console.log('exit', categoryFolders);
  return categoryFolders;
};

export const isFlatRoot = (folder: ImportedFolder): boolean => folder.name === 'fakeflatroot';

export const flatImportedFoldersToCategories = (rootFolder: ImportedFolder): ImportedFolder => {
  const flats = flatImportedFoldersToCategoriesRecursive(rootFolder);
  if (flats.length === 1) {
    return flats[0];
  }
  return {
    ...newImportedFolder(0, null),
    name: 'fakeflatroot',
    folders: flatImportedFoldersToCategoriesRecursive(rootFolder),
  };
};
