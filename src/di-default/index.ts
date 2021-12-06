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
import {KV} from '../kv/sync';
import toolsFactory from '../ui/tools/default';
import {Tools} from '../ui/tools';
import {BaseLayer} from '../ui/layers/base';
import baseLayerFactory from '../ui/layers/base/default';
import workspaceFactory from '../ui/workspace/default';
import {Catalog} from '../catalog';
import catalogUIFactory from '../ui/catalog/default';
import {CatalogUI} from '../ui/catalog';
import {importUIFactory} from '../ui/import/default';
import {ImportUI} from '../ui/import';
import {Parser} from '../importer';
import {exporterFactory} from '../exporter/default';
import {Exporter} from '../exporter';
import {wordingFactory} from '../personalization/wording/default';
import {Wording} from '../personalization/wording';
import {parserFactory} from '../importer/default';
import {map2StylesFactory} from '../style/default/styles';
import {Map2Styles} from '../style';
import localStorageFactory from '../kv/sync/localStorage';
import indexedDbFactory from '../kv/promise/indexedDB';
import {KvPromise} from '../kv/promise';
import {CatalogDefault} from '../catalog/default/catalog';
import {CatalogStorageIndexedDb} from '../catalog/storage/indexeddb';

const localStorageSingleton = localStorageFactory();
export const getLocalStorage = (): KV => localStorageSingleton;

const remoteStorageSingleton = indexedDbFactory('map2');
export const getRemoteStorage = (): KvPromise => remoteStorageSingleton;

const map2StylesSingleton = map2StylesFactory();
export const getMap2Styles = (): Map2Styles => map2StylesSingleton;

const toolsSingleton = toolsFactory(localStorageSingleton, map2StylesSingleton);
export const getTools = (): Tools => toolsSingleton;

const baseLayerSingleton = baseLayerFactory(localStorageSingleton);
export const getBaseLayer = (): BaseLayer => baseLayerSingleton;

const workspaceSingleton = workspaceFactory(localStorageSingleton);
export const getWorkspace = (): Workspace => workspaceSingleton;

const wordingSingleton = wordingFactory(localStorageSingleton);
export const getWording = (): Wording => wordingSingleton;

const importUISingleton = importUIFactory(localStorageSingleton);
export const getImportUI = (): ImportUI => importUISingleton;

const parserSingleton = parserFactory(map2StylesSingleton);
export const getParser = (): Parser => parserSingleton;

const exporterSingleton = exporterFactory(localStorageSingleton);
export const getExporter = (): Exporter => exporterSingleton;

const catalogStorageSingleton = new CatalogStorageIndexedDb(remoteStorageSingleton, map2StylesSingleton);

const catalogSingleton = new CatalogDefault(catalogStorageSingleton, wordingSingleton, map2StylesSingleton, 'main');
export const getCatalog = (): Catalog => catalogSingleton;

const catalogUISingleton = catalogUIFactory(localStorageSingleton, catalogSingleton);
export const getCatalogUI = (): CatalogUI => catalogUISingleton;

export const initDI = async (): Promise<void> => {
  console.log('initDI start');
  await catalogSingleton.init();
  console.log('initDI done');
};
