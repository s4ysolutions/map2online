import {Workspace} from '../app-rx/ui/workspace';
import localStorageSingleton from '../kv-rx/localStorage';
import {KV} from '../kv-rx';
import toolsFactory from '../app-rx/ui/tools/default';
import {Tools} from '../app-rx/ui/tools';
import {BaseLayer} from '../app-rx/ui/layers/base';
import baseLayerFactory from '../app-rx/ui/layers/base/default';
import workspaceFactory from '../app-rx/ui/workspace/default';

export const getLocalStorage = (): KV => localStorageSingleton;

const toolsSingleton = toolsFactory(localStorageSingleton);
export const getTools = (): Tools => toolsSingleton;

const baseLayerSingleton = baseLayerFactory(localStorageSingleton);
export const getBaseLayer = (): BaseLayer => baseLayerSingleton;

const workspaceSingleton = workspaceFactory(localStorageSingleton);
export const getWorkspace = (): Workspace => workspaceSingleton;

