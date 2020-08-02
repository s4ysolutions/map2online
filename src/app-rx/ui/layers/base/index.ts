import {Observable} from 'rxjs';
import {Coordinate} from '../../../catalog';

export interface BaseLayerState {
  readonly x: number;
  readonly y: number;
  readonly zoom: number;
}

export interface BaseLayer {
  sourceName: string;
  sourceNameObservable: () => Observable<string>;
  state: BaseLayerState;
  stateObservable: () => Observable<BaseLayerState>;
  draggingObservable: () => Observable<Coordinate>;

  setDragging(coordinate: Coordinate);
}
