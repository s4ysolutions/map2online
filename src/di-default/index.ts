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
import catalogUiFactory from '../app-rx/ui/catalog/default';
import {CatalogUI} from '../app-rx/ui/catalog';

export const getLocalStorage = (): KV => localStorageSingleton;

const toolsSingleton = toolsFactory(localStorageSingleton);
export const getTools = (): Tools => toolsSingleton;

const baseLayerSingleton = baseLayerFactory(localStorageSingleton);
export const getBaseLayer = (): BaseLayer => baseLayerSingleton;

const workspaceSingleton = workspaceFactory(localStorageSingleton);
export const getWorkspace = (): Workspace => workspaceSingleton;

const catalogSingleton = catalogFactory(localStorageSingleton);
export const getCatalog = (): Catalog => catalogSingleton;

const catalogUiSingleton = catalogUiFactory(localStorageSingleton, catalogSingleton);
export const getCatalogUI = (): CatalogUI => catalogUiSingleton;

window['catalog'] = catalogSingleton;
window['catalogUi'] = catalogUiSingleton;
