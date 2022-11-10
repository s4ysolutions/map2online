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

import {SearchResponse} from '../../search';
import {Observable} from 'rxjs';
import {Map2Color} from '../../style/colors';

export interface SearchUI {
  observable(): Observable<SearchResponse[]>; // new search results arrived
  observableMapUpdate():Observable<{searchResponse: SearchResponse, color: Map2Color | null}>;
  observableMapUpdateForResponse(searchResponse: SearchResponse):Observable<Map2Color | null>;
  setResponse(subject: string, results: SearchResponse[]): Promise<void>;
  addToMap(searchResponse: SearchResponse, color: Map2Color): Promise<void>;
  removeFromMap(searchResponse: SearchResponse): Promise<void>;
  isOnMap(searchResponse: SearchResponse): Promise<Map2Color | null>;
  observableShowResponse(): Observable<boolean>; // new search results arrived
  showResponse: boolean;
}
