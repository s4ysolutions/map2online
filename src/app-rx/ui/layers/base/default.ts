import {getMapDefinition} from '../../../../map-sources/definitions';
import {BaseLayer} from './index';
import {KV} from '../../../../kv-rx';

const baseLayerFactory = (persistentStorage: KV): BaseLayer => ({
  getOlSource: function () {
    if (!this.sourceName) {
      return null;
    }
    const md = getMapDefinition(this.sourceName);
    if (!md) {
      return null;
    }
    if (!md.olSourceFactory) {
      return null;
    }
    return md.olSourceFactory();
  },
  setSourceName: function (name: string) {
    persistentStorage.set('blsn', name);
  },
  sourceName: persistentStorage.get('blsn', 'Openstreet'),
  sourceNameObservable: () => persistentStorage.observable<string>('blsn'),
  x: persistentStorage.get('blx', 0),
  xObservable: () => persistentStorage.observable<number>('blx'),
  y: persistentStorage.get('bly', 0),
  yObservable: () => persistentStorage.observable<number>('bly'),
  zoom: persistentStorage.get('blzoom', 5),
  zoomObservable: () => persistentStorage.observable<number>('blzoom'),
});

export default baseLayerFactory;
