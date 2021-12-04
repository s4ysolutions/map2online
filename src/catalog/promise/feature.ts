import {Feature, FeatureProps, ID, LineString, Point} from '../index';
import {KvPromise} from '../../kv/promise';
import {Observable} from 'rxjs';
import {FeatureBase} from '../base/feature';
import {Map2Styles} from '../../style';
import {CatalogStoragePromise} from '../storage';


export class FeaturePromise extends FeatureBase {
  private readonly storage: KvPromise;

  constructor(storage: KvPromise, props: FeatureProps | null) {
    super(props);
    this.storage = storage;
  }

  delete(): void {
    this.storage.delete(this.id);
  }

  observable(): Observable<Feature> {
    return undefined;
  }

  protected update(): void {
    const map2style = this.map2styles.findEq(p.style);
    if (map2style) {
      // eslint-disable-next-line no-unused-vars,@typescript-eslint/no-unused-vars
      const {style: _, ...pp} = p;
      storage.set(key, {...pp, styleId: map2style.id});
    } else {
      storage.set(key, p);
    }
  }

}