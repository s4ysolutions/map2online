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

import {Search, SearchCache, SearchError, SearchErrorCode, SearchResponse} from './index';

export interface NominatimGeocodeAddress {
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

export interface NominatimResponse {
  address: NominatimGeocodeAddress;

  boundingbox: string[];

  class: string;

  display_name: string;

  importance: number;

  lat: string;

  licence: string;

  lon: string;

  osm_id: string;

  osm_type: string;

  place_id: string;

  svg: string;

  type: string;

  extratags: unknown;
}


const isNominatimResponse = (obj: unknown): obj is NominatimResponse => (obj as NominatimResponse).osm_id !== undefined;

class NominatimSearch implements Search {
  private cache: SearchCache;

  constructor(cache: SearchCache) {
    this.cache = cache;
  }

  search(subject: string, lang: string): Promise<SearchResponse[]> {

    const cacheKey = `${subject}@${lang}`;
    const cached = this.cache.get(cacheKey);

    if (cached !== null && Array.isArray(cached)) {
      return Promise.resolve(cached.filter(c => isNominatimResponse(c)));
    }

    const url =
      `https://nominatim.openstreetmap.org/search.php?q=${subject}&polygon_geojson=1&format=jsonv2&accept_language=${lang}`;

    const headers = new Headers();
    if (lang) {
      headers.append('Accept-Language', lang);
    }
    const request = new Request(url, {headers});
    return fetch(request).then(response => {
      if (response.ok) {
        return response.json();
      }
      return Promise.reject(new SearchError(
        SearchErrorCode.UNKNOWN,
        `${response.status} ${response.statusText}`,
      ));
    })
      .then(response => {
        if (Array.isArray(response)) {
          const nominatimResponses = response.filter(r => isNominatimResponse(r)) as NominatimResponse[];
          this.cache.add(cacheKey, nominatimResponses);
          return nominatimResponses;
        }

        return Promise.reject(new SearchError(
          SearchErrorCode.INVALID_RESPONSE,
          JSON.stringify(response),
        ));
      });
  }
}

export default NominatimSearch;
