import {ImportedFolder, newImportedFolder} from './index';
import T from '../l10n';

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
const getStatsRecursive = (folder: ImportedFolder, level: number, depth: number, mixed: ImportedFolder[], categories: number, routes: number): {
  readonly mixed: ImportedFolder[],
  readonly depth: number,
  readonly categories: number,
  readonly routes: number,
} => {
  const m = [];
  let r = 0;
  let c = 0;
  // console.log(`enter depth=${depth} level=${level} categroies=${categories} routes=${routes}`, folder);
  if (folder.features.length > 0) {
    r++;
    if (folder.folders.length > 0) {
      m.push(folder);
    }
  }

  let d = level > depth ? level : depth;

  for (const f of folder.folders) {
    if (f.features.length > 0) {
      c = 1;
      // console.log('++++ category features > 0', c, folder.description);
      break;
    }
  }

  for (const f of folder.folders) {
    const stat = getStatsRecursive(f, level + 1, d, m, 0, 0);
    c += stat.categories;
    r += stat.routes;
    // console.log('++++ category child > 0', c, f.description);

    // console.log('++++ route child > 0', r, f.description);
    if (stat.depth > d) {
      d = stat.depth;
    }
  }

  // console.log(`exit depth=${d} level=${level} categories=${c} routes=${r}`);
  return {mixed: mixed.concat(m), depth: d, categories: categories + c, routes: routes + r};
};

export const getImportedFolderStats = (rootFolder: ImportedFolder): {
  readonly mixed: ImportedFolder[],
  readonly depth: number,
  readonly categories: number,
  readonly routes: number,
} =>
  getStatsRecursive(rootFolder, 0, 0, [], 0, 0);

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
