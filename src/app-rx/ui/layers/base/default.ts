import {BaseLayer, BaseLayerState} from './index';
import {KV} from '../../../../kv-rx';
import {Subject} from 'rxjs';
import {Coordinate} from '../../../catalog';

const baseLayerFactory = (persistentStorage: KV): BaseLayer => {
  const draggingSubject = new Subject<Coordinate>();
  return {
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
    draggingObservable: () => draggingSubject,
    setDragging(coordinate: Coordinate) {
      draggingSubject.next(coordinate)
    }
  }
};

export default baseLayerFactory;