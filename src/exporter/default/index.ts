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

import {Exporter} from '../index';
import {Category, Route} from '../../app-rx/catalog';
import {getCategoriesKML, getRoutesKML} from '../lib/kml';
import {KV} from '../../kv-rx';

const MIME_KML = 'application/vnd.GoogleMap-earth.kml+xml';

const download = (file: string, content: string, mime: string): void => {
  const blob = new Blob([content], {type: mime});
  const a: HTMLAnchorElement = document.createElement('a');
  a.download = file;
  a.href = window.URL.createObjectURL(blob);
  a.click();
};

export const exporterFactory = (storage: KV): Exporter => ({
  get onlyVisible() {
    return storage.get<boolean>('expov', true);
  },
  set onlyVisible(value) {
    storage.set('expov', value);
  },
  onlyVisibleObservable: () => storage.observable<boolean>('expov'),
  exportRoutesKML: (routes: Route[], category?: Category): void => {
    download((category ? `${category.title}-` : '') + (routes.length === 1 ? `${routes[0].title}.kml` : category ? `${category.title}.kml` : `map2online-${Date.now()}.kml`), getRoutesKML(routes, category), MIME_KML);
  },
  exportCategoriesKML: (categories: Category[]): void => {
    download(categories.length === 1 ? `${categories[0].title}.kml` : `map2online-${Date.now()}.kml`, getCategoriesKML(categories), MIME_KML);
  },
});
