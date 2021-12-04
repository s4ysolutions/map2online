import {KvPromise} from '../../kv/promise';
import {CatalogStorage} from './index';
import {FeatureProps, ID} from '../index';
import {Map2Styles} from '../../style';
import { Observable } from 'rxjs';

export const FEATURE_ID_PREFIX = 'f';
export const FEATURES_ID_PREFIX = 'fs';

interface FeaturePropsStyleId extends FeatureProps {
  styleId: string;
}

class CatalogStorageIndexedDb implements CatalogStorage {
  private readonly kv: KvPromise;

  private readonly map2styles: Map2Styles;

  constructor(kv: KvPromise, map2styles: Map2Styles) {
    this.kv = kv;
    this.map2styles = map2styles;
  }

  deleteFeatureProps(props: FeatureProps): Promise<void> {
    return Promise.all([
      this.kv.delete(`${FEATURE_ID_PREFIX}@${props.id}`),
      this.kv.delete(`vis@${props.id}`), // visibility
      this.kv.delete(`op@${props.id}`), // menu open
    ]) as unknown as Promise<void>;
  }

  observableFeatureProps(props: FeatureProps): Observable<FeatureProps> {
    return this.kv.observable<FeatureProps | null>(`${FEATURE_ID_PREFIX}@${props.id}`);
  }

  readFeatueProps(id: ID): Promise<FeatureProps | null> {
    return this.kv.get<FeaturePropsStyleId | null>(`${FEATURE_ID_PREFIX}@${id}`, null).then(props => {
      if (props === null) {
        return null;
      }
      const style = props.styleId
        ? (this.map2styles.byId(props.styleId) || this.map2styles.defaultStyle)
        : this.map2styles.defaultStyle;
      // eslint-disable-next-line no-unused-vars,@typescript-eslint/no-unused-vars
      const {styleId: _, ...pp} = props;
      return {...pp, style};
    });
  }

  updateFeatureProps(props: FeatureProps): Promise<void> {
    const map2style = this.map2styles.findEq(props.style);
    const key = `${FEATURE_ID_PREFIX}@${props.id}`;
    // eslint-disable-next-line no-unused-vars,@typescript-eslint/no-unused-vars
    const {style: _, ...pp} = props;
    if (map2style) {
      return this.kv.set(key, {...pp, styleId: map2style.id});
    }
    return this.kv.set(key, pp);
  }
}
