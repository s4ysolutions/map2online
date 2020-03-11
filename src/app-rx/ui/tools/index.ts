import {Color} from '../../../lib/colors';
import {Observable} from 'rxjs';

export enum FeatureType {
  Line,
  Point,
}

export interface Tools {
  readonly colorLine: Color;
  colorLineObservable: () => Observable<Color>;
  readonly colorPoint: Color;
  colorPointObservable: () => Observable<Color>;
  readonly isLine: boolean;
  isLineObservable: () => Observable<boolean>;
  readonly isPoint: boolean;
  isPointObservable: () => Observable<boolean>;
  selectColor: (color: Color) => void;
  selectLine: () => void;
  selectPoint: () => void;
  readonly featureType: FeatureType;
  featureTypeObservable: () => Observable<FeatureType>;
}
