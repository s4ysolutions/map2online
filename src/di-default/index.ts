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

import {Workspace} from '../app-rx/ui/workspace';
import localStorageSingleton from '../kv-rx/localStorage';
import {KV} from '../kv-rx';
import toolsFactory from '../app-rx/ui/tools/default';
import {Tools} from '../app-rx/ui/tools';
import {BaseLayer} from '../app-rx/ui/layers/base';
import baseLayerFactory from '../app-rx/ui/layers/base/default';
import workspaceFactory from '../app-rx/ui/workspace/default';
import {Catalog} from '../app-rx/catalog';
import catalogFactory from '../app-rx/catalog/default/catalog';
import catalogUIFactory from '../app-rx/ui/catalog/default';
import {CatalogUI} from '../app-rx/ui/catalog';
import {designerFactory} from '../app-rx/ui/designer/default/designer';
import {Designer} from '../app-rx/ui/designer';
import {importUIFactory} from '../app-rx/ui/import/default';
import {ImportUI} from '../app-rx/ui/import';
import {kmlParserFactory} from '../importer/default/kml-parser';
import {Parser} from '../importer';
import {exporterFactory} from '../exporter/default';
import {Exporter} from '../exporter';
import {wordingFactory} from '../app-rx/personalization/wording/default';
import {Wording} from '../app-rx/personalization/wording';
import {parserFactory} from '../importer/default';

export const getLocalStorage = (): KV => localStorageSingleton;

const toolsSingleton = toolsFactory(localStorageSingleton);
export const getTools = (): Tools => toolsSingleton;

const baseLayerSingleton = baseLayerFactory(localStorageSingleton);
export const getBaseLayer = (): BaseLayer => baseLayerSingleton;

const workspaceSingleton = workspaceFactory(localStorageSingleton);
export const getWorkspace = (): Workspace => workspaceSingleton;

const wordingSingleton = wordingFactory(localStorageSingleton);
export const getWording = (): Wording => wordingSingleton;

const catalogSingleton = catalogFactory(localStorageSingleton, wordingSingleton);
export const getCatalog = (): Catalog => catalogSingleton;

const catalogUISingleton = catalogUIFactory(localStorageSingleton, catalogSingleton);
export const getCatalogUI = (): CatalogUI => catalogUISingleton;

const designerSingleton = designerFactory(catalogSingleton, catalogUISingleton);
export const getDesigner = (): Designer => designerSingleton;

const importUISingleton = importUIFactory(localStorageSingleton);
export const getImportUI = (): ImportUI => importUISingleton;

const parserSingleton = parserFactory();
export const getParser = (): Parser => parserSingleton;

const exporterSingleton = exporterFactory();
export const getExporter = (): Exporter => exporterSingleton;

