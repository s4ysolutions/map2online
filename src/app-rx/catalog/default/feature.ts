import {Catalog, Feature, FeatureProps, Features, ID} from '../index';
import {KV} from '../../../kv-rx';
import {Subject} from 'rxjs';

export const FEATURE_ID_PREFIX = "f";

export const featureFactory = (storage: KV, props: FeatureProps | null): Feature | null => {
  const subject = new Subject<Feature>();
  return props === null
    ? null
    : {
      ...props,
      delete: () => {
      },
      observable: () => subject,
      update: () => {
      },
    };
};

export const featuresFactory = (storage: KV, catalog: Catalog, ids: ID[]): Features => {
  let ids0 = [...ids];
  const subject = new Subject<Features>();
  return {
    add: function (props: FeatureProps, position: number) {
      const pos = position || ids.length;
      ids0 = ids.slice(0, pos).concat(props.id).concat(ids.slice(pos));
      subject.next(this);
    },
    byPos: (index: number): Feature | null => catalog.featureById(ids0[index]),
    get length() {
      return ids.length
    },
    observable: () => subject,
    remove: function (category: Feature): number {
      const pos = ids.indexOf(category.id);
      if (pos === -1) return -1;
      ids = ids.slice(0, pos).concat(ids.slice(pos + 1));
      subject.next(this);
    },
    [Symbol.iterator]: () => {
      const _ids = [...ids];
      const _me = this;
      let _current = 0;
      return {
        next: () => {
          return _current >= _ids.length
            ? {done: true, value: null,}
            : {done: false, value: _me.byPos(_current++)};
        }
      };
    }
  }
};
