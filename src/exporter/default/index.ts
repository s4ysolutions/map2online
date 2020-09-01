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
import {getRoutesKML} from '../lib/kml';

const MIME_KML = 'application/vnd.GoogleMap-earth.kml+xml';

const download = (file: string, content: string, mime: string): void => {
  const blob = new Blob([content], {type: mime});
  const a: HTMLAnchorElement = document.createElement('a');
  a.download = file;
  a.href = window.URL.createObjectURL(blob);
  a.click();
};

export const exporterFactory = (): Exporter => ({
  exportRoutesKML: (routes: Route[], category?: Category): void => {
    download(category ? `${category.title}.kml` : 'map2.kml', getRoutesKML(routes, category), MIME_KML);
  },
});
