import Source from 'ol/source/Source';
import {Observable} from 'rxjs';

export interface BaseLayer {
  readonly sourceName: string;
  sourceNameObservable: () => Observable<string>;
  readonly x: number;
  xObservable: () => Observable<number>;
  readonly y: number;
  yObservable: () => Observable<number>;
  readonly zoom: number;
  zoomObservable: () => Observable<number>;
  getOlSource: () => Source | null;
  setSourceName: (string) => void;
}
