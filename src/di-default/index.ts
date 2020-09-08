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

import {Workspace} from '../ui/workspace';
import localStorageSingleton from '../kv-rx/localStorage';
import {KV} from '../kv-rx';
import toolsFactory from '../ui/tools/default';
import {Tools} from '../ui/tools';
import {BaseLayer} from '../ui/layers/base';
import baseLayerFactory from '../ui/layers/base/default';
import workspaceFactory from '../ui/workspace/default';
import {Catalog} from '../catalog';
import catalogFactory from '../catalog/default/catalog';
import catalogUIFactory from '../ui/catalog/default';
import {CatalogUI} from '../ui/catalog';
import {designerFactory} from '../ui/designer/default/designer';
import {Designer} from '../ui/designer';
import {importUIFactory} from '../ui/import/default';
import {ImportUI} from '../ui/import';
import {kmlParserFactory} from '../importer/default/kml-parser';
import {Parser} from '../importer';
import {exporterFactory} from '../exporter/default';
import {Exporter} from '../exporter';
import {wordingFactory} from '../personalization/wording/default';
import {Wording} from '../personalization/wording';
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

const exporterSingleton = exporterFactory(localStorageSingleton);
export const getExporter = (): Exporter => exporterSingleton;

