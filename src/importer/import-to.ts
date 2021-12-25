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

import {Catalog, Category, CategoryProps, Feature, FeatureProps, Route, RouteProps} from '../catalog';
import {isFlatRoot} from './post-process';
import {ImportedFolder} from './index';
import {makeEmptyRichText} from '../richtext';

export enum ImportTo {
  // eslint-disable-next-line no-unused-vars
  ALL_FEATURES_TO_ACTIVE_ROUTE,
  // eslint-disable-next-line no-unused-vars
  ALL_ROUTES_TO_CATEGORY,
  // eslint-disable-next-line no-unused-vars
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

const importFeaturesToRoute = (catalog: Catalog, features: FeatureProps[], route: Route): Promise<Feature[]> => {
  const autoCreate = catalog.disableAutoCreateCategoryAndRoute();
  return Promise.all(features.map(feature => route.features.add(feature)))
    .then(retFeatures => {
      catalog.setAutoCreateCategoryAndRoute(autoCreate);
      return retFeatures;
    });
};

const folderToRoute = (folder: ImportedFolder): RouteProps => ({
  description: folder.description,
  id: null,
  summary: '',
  title: folder.name,
  visible: folder.visible,
  open: folder.open,
});

const foldersOfRoutesRecursive = (folders: ImportedFolder[], routes: ImportedFolder[]): ImportedFolder[] => {
  for (const folder of folders) {
    if (folder.features.length > 0) {
      routes.push(folder);
    }
    foldersOfRoutesRecursive(folder.folders, routes);
  }
  return routes;
};

const foldersOfRoutes = (folders: ImportedFolder[]): ImportedFolder[] => foldersOfRoutesRecursive(folders, []);

const importFoldersToCategory = (catalog: Catalog, folders: ImportedFolder[], category: Category): Promise<Feature[]> => {
  const autoCreate = catalog.disableAutoCreateCategoryAndRoute();
  return Promise.all([].concat(folders.map(folder =>
    category.routes.add(folderToRoute(folder))
      .then(route => importFeaturesToRoute(catalog, folder.features, route)))))
    .then(features => {
      catalog.setAutoCreateCategoryAndRoute(autoCreate);
      return features;
    });
};

const foldersOfCategoriesRecursive = (folders: ImportedFolder[], categories: ImportedFolder[]): ImportedFolder[] => {
  for (const folder of folders) {
    if (folder.folders.reduce((count, f) => count + f.features.length, 0) > 0) {
      categories.push(folder);
    }
    foldersOfCategoriesRecursive(folder.folders, categories);
  }
  return categories;
};

const foldersOfCategories = (folders: ImportedFolder[]): ImportedFolder[] => foldersOfCategoriesRecursive(folders, []);

const folderToCategory = (folder: ImportedFolder): CategoryProps => ({
  description: folder.description ? folder.description : makeEmptyRichText(),
  id: null,
  summary: '',
  title: folder.name,
  visible: folder.visible,
  open: folder.open,
});

const importFoldersToCatalog = (catalog: Catalog, folders: ImportedFolder[]): Promise<Feature[]> => {
  const autoCreate = catalog.disableAutoCreateCategoryAndRoute();
  return Promise.all([].concat(folders.map(folder =>
    catalog.categories.add(folderToCategory(folder))
      .then(category => importFoldersToCategory(catalog, folder.folders, category)))))
    .then(features => {
      catalog.setAutoCreateCategoryAndRoute(autoCreate);
      return features;
    });
};

export const importFlatFolders = (rootFolder: ImportedFolder, importTo: ImportTo, catalog: Catalog, activeCategory: Category, activeRoute: Route): Promise<Feature[]> => {
  const folders = isFlatRoot(rootFolder) ? rootFolder.folders : [rootFolder];
  switch (importTo) {
    case ImportTo.ALL_FEATURES_TO_ACTIVE_ROUTE:
      return importFeaturesToRoute(catalog, foldersToFeatures(folders), activeRoute);
    case ImportTo.ALL_ROUTES_TO_CATEGORY:
      return importFoldersToCategory(catalog, foldersOfRoutes(folders), activeCategory);
    case ImportTo.ALL_CATEGORIES_TO_CATALOG:
      return importFoldersToCatalog(catalog, foldersOfCategories(folders));
    default:
      throw Error('Invalid importTo');
  }
};
