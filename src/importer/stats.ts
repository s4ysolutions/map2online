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

import {ImportedFolder} from './index';

const getStatsRecursive = (folder: ImportedFolder, level: number, depth: number, mixed: ImportedFolder[], categories: number, routes: number): {
  readonly mixed: ImportedFolder[],
  readonly depth: number,
  readonly categories: number,
  readonly routes: number,
} => {
  let m = [];
  let r = 0;
  let c = 0;
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
      break;
    }
  }

  for (const f of folder.folders) {
    const stat = getStatsRecursive(f, level + 1, d, [], 0, 0);
    c += stat.categories;
    r += stat.routes;
    m = m.concat(stat.mixed);
    if (stat.depth > d) {
      d = stat.depth;
    }
  }

  return {mixed: mixed.concat(m), depth: d, categories: categories + c, routes: routes + r};
};

export const getImportedFolderStats = (rootFolder: ImportedFolder): {
  readonly mixed: ImportedFolder[],
  readonly depth: number,
  readonly categories: number,
  readonly routes: number,
} =>
  getStatsRecursive(rootFolder, 0, 0, [], 0, 0);
