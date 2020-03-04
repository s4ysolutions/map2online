import {Color} from '../../colors';
import {Observable} from 'rxjs';

export enum Tool {
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
  readonly tool: Tool;
  toolObservable: () => Observable<Tool>;
}
