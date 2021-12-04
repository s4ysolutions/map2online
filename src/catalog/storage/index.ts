import {FeatureProps, ID} from '../index';
import {Observable} from 'rxjs';

export interface CatalogStorage {
  readFeatueProps(id: ID): Promise<FeatureProps | null>;
  updateFeatureProps(props: FeatureProps): Promise<void>;
  deleteFeatureProps(props: FeatureProps): Promise<void>;
  observableFeatureProps(props: FeatureProps): Observable<FeatureProps>;

  readFeaturesIds(routeId: ID): Promise<ID[] | null>;
  updateFeaturesIds(routeId: ID, ids: ID[]): Promise<void>;
  deleteFeaturesIds(routeId: ID): Promise<void>;
  observableFeaturesIds(routeId: ID): Observable<ID[] | null>;
}
