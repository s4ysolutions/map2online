/*
 * Copyright 2019 s4y.solutions
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {Observable} from 'rxjs';
import {Style} from '../../style';

export enum SelectedTool {
  Line,
  Point,
}

export interface Tools {
  readonly lineStyle: Style;
  lineStyleObservable: () => Observable<Style>;
  readonly pointStyle: Style;
  pointStyleObservable: () => Observable<Style>;
  readonly isLine: boolean;
  isLineObservable: () => Observable<boolean>;
  readonly isPoint: boolean;
  isPointObservable: () => Observable<boolean>;
  selectStyle: (style: Style) => void;
  selectLine: () => void;
  selectPoint: () => void;
  readonly selectedTool: SelectedTool;
  selectedToolObservable: () => Observable<SelectedTool>;
}
