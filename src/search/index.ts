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


export enum SearchErrorCode {
  UNKNOWN,
  INVALID_RESPONSE,
}

export class SearchError extends Error {
  code: SearchErrorCode;

  constructor(code: SearchErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

export interface GeocodeAddress {
  'county': string;
  'city': string;
  'city_district': string;
  'construction': string;
  'continent': string;
  'country': string;
  'country_code': string;
  'house_number': string;
  'neighbourhood': string;
  'postcode': string;
  'public_building': string;
  'state': string;
  'suburb': string;
}

export interface SearchResponse {
  address: GeocodeAddress;

  boundingbox: string[];

  class: string;

  display_name: string;

  importance: number;

  lat: string;

  licence: string;

  lon: string;

  osm_id?: string;

  osm_type?: string;

  place_id: string;

  svg: string;

  type: string;

  extratags: unknown;
}

export type CacheKey = string;
export type CacheObject = SearchResponse[];

export interface SearchCache {
  add(key: CacheKey, object: CacheObject): Promise<void>;
  has(key: CacheKey): Promise<boolean>;
  get(key: CacheKey): Promise<CacheObject | null>;
}

export interface Search {
  search(subject: string, lang?: string): Promise<SearchResponse[]>;
}
