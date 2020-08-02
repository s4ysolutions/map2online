import {BaseLayer, BaseLayerState} from './index';
import {KV} from '../../../../kv-rx';

const baseLayerFactory = (persistentStorage: KV): BaseLayer => ({
  get sourceName() {
    return persistentStorage.get('blsn', 'Openstreet')
  },
  set sourceName(name) {
    persistentStorage.set('blsn', name);
  },
  sourceNameObservable: () => persistentStorage.observable<string>('blsn'),
  get state() {
    return persistentStorage.get<BaseLayerState>('blst', {x: 0, y: 0, zoom: 5})
  },
  set state(state) {
    const s = this.state
    if (s.x !== state.x || s.y !== state.y || s.zoom !== state.zoom) {
      persistentStorage.set<BaseLayerState>('blst', state)
    }
  },
  stateObservable: () => persistentStorage.observable<BaseLayerState>('blst'),
});

export default baseLayerFactory;
