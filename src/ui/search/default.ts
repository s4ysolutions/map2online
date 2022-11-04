/*
 * Copyright 2022 s4y.solutions
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 * limitations under the License.
 */


import {SearchUI} from './index';
import {Observable, Subject} from 'rxjs';
import {SearchResponse} from '../../search';
import {Map2Color} from '../../style/colors';
import {ID} from '../../catalog';
import {filter, map} from 'rxjs/operators';

class DefaultSearchUI implements SearchUI {
  private _observable = new Subject<SearchResponse[]>();

  private _observableMapUpdate = new Subject<{searchResponse: SearchResponse, color: Map2Color | null}>();

  private _onMap: Record<ID, Map2Color> = {};

  observable(): Observable<SearchResponse[]> {
    return this._observable;
  }

  setResponse(subject: string, results: SearchResponse[]): Promise<void> {
    this._observable.next(results);
    return Promise.resolve();
  }

  addToMap(searchResponse: SearchResponse, color: Map2Color): Promise<void> {
    this._onMap[searchResponse.id] = color;
    this._observableMapUpdate.next({searchResponse, color});
    return Promise.resolve();
  }

  removeFromMap(searchResponse: SearchResponse): Promise<void> {
    delete this._onMap[searchResponse.id];
    this._observableMapUpdate.next({searchResponse, color: null});
    return Promise.resolve();
  }

  isOnMap(searchResponse: SearchResponse): Promise<Map2Color | null> {
    const color = this._onMap[searchResponse.id];
    return Promise.resolve(color === undefined ? null : color);
  }

  observableMapUpdate():Observable<{searchResponse: SearchResponse, color: Map2Color | null}> {
    return this._observableMapUpdate;
  }

  observableMapUpdateForResponse(searchResponse: SearchResponse):Observable<Map2Color | null> {
    return this._observableMapUpdate.pipe(
      filter(r => r.searchResponse.id === searchResponse.id),
      map(r => r.color),
    );
  }
}

export default DefaultSearchUI;
