import {Feature} from '../../catalog';
import {Observable} from 'rxjs';

export interface VisibleFeatures extends Iterable<Feature> {
  readonly length: number;
  observable: () => Observable<VisibleFeatures>;
}

export interface Designer {
  readonly visibleFeatures: VisibleFeatures;
}