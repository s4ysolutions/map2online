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

import {Catalog, Category, CategoryProps, Feature, FeatureProps, Route, RouteProps} from '../app-rx/catalog';
import {isFlatRoot} from './post-process';
import {ImportedFolder} from './index';

export enum ImportTo {
  ALL_FEATURES_TO_ACTIVE_ROUTE,
  ALL_ROUTES_TO_CATEGORY,
  ALL_CATEGORIES_TO_CATALOG
}

const foldersToFeaturesRecursive = (folders: ImportedFolder[], features: FeatureProps[]): FeatureProps[] => {
  for (const folder of folders) {
    for (const feature of folder.features) {
      features.push(feature);
    }
    foldersToFeaturesRecursive(folder.folders, features);
  }
  return features;
};

const foldersToFeatures = (folders: ImportedFolder[]): FeatureProps[] => foldersToFeaturesRecursive(folders, []);

const importFeaturesToRoute = (features: FeatureProps[], route: Route): Promise<Feature[]> =>
  Promise.all(features.map(feature => route.features.add(feature)));

const folderToRoute = (folder: ImportedFolder): RouteProps => ({
  description: folder.description,
  id: null,
  summary: '',
  title: folder.name,
  visible: true,
});

const importFoldersToCategory = (folders: ImportedFolder[], category: Category): Promise<Feature[]> =>
  Promise.all([].concat(folders.map(folder =>
    category.routes.add(folderToRoute(folder))
      .then(route =>
        importFeaturesToRoute(folder.features, route)))));

const folderToCategory = (folder: ImportedFolder): CategoryProps => ({
  description: folder.description,
  id: null,
  summary: '',
  title: folder.name,
  visible: true,
});

const importFoldersToCatalog = (folders: ImportedFolder[], catalog: Catalog): Promise<Feature[]> =>
  Promise.all([].concat(folders.map(folder =>
    catalog.categories.add(folderToCategory(folder))
      .then(category =>
        importFoldersToCategory(folder.folders, category)))));

export const importFlatFolders = (rootFolder: ImportedFolder, importTo: ImportTo, catalog: Catalog, activeCategory: Category, activeRoute: Route): Promise<Feature[]> => {
  const folders = isFlatRoot(rootFolder) ? rootFolder.folders : [rootFolder];
  switch (importTo) {
    case ImportTo.ALL_FEATURES_TO_ACTIVE_ROUTE:
      return importFeaturesToRoute(foldersToFeatures(folders), activeRoute);
    case ImportTo.ALL_ROUTES_TO_CATEGORY:
      return importFoldersToCategory(folders, activeCategory);
    case ImportTo.ALL_CATEGORIES_TO_CATALOG:
      return importFoldersToCatalog(folders, catalog);
    default:
      throw Error('Invalid importTo');
  }
};
