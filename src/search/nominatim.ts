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

import {transform} from 'ol/proj';
import {Search, SearchCache, SearchError, SearchErrorCode, SearchResponse} from './index';
import {makeId} from '../lib/id';

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
const NOMINATIM_PROJECTION = 'EPSG:4326';

class NominatimSearch implements Search {
  private cache: SearchCache;

  constructor(cache: SearchCache) {
    this.cache = cache;
  }

  projection = NOMINATIM_PROJECTION;

  private searchURL(targetProjection: string, url: string, lang: string): Promise<SearchResponse[]> {

    const cacheKey = url;
    const cached = this.cache.get(cacheKey);

    if (cached !== null && Array.isArray(cached)) {
      return Promise.resolve(cached.filter(c => isNominatimResponse(c)));
    }

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
          const nominatimResponses = response
            .filter(r => isNominatimResponse(r))// as NominatimResponse[]
            .map(r => {
              r.id = (r.osm_id) ? r.osm_id : makeId();
              r.projection = this.projection;
              const [lon, lat] =
                transform([parseFloat(r.lon), parseFloat(r.lat)], NOMINATIM_PROJECTION, targetProjection);
              r.lon = lon;
              r.lat = lat;
              return r as SearchResponse;
            })
          ;
          this.cache.add(cacheKey, nominatimResponses);
          return nominatimResponses;
        }

        return Promise.reject(new SearchError(
          SearchErrorCode.INVALID_RESPONSE,
          JSON.stringify(response),
        ));
      });
  }

  searchWithinArea(targetProjection: string, subject: string, x1: number, y1: number, x2: number, y2: number, lang: string): Promise<SearchResponse[]> {
    const url =
      `https://nominatim.openstreetmap.org/search.php?q=${encodeURI(subject)}&polygon_geojson=1&format=jsonv2&viewbox=${x1},${y1},${x2},${y2}&bounded=1${lang ? `&accept_language=${lang}` : ''}`;
    return this.searchURL(targetProjection, url, lang);
  }

  search(targetProjection: string, subject: string, lang: string): Promise<SearchResponse[]> {
    const url =
      `https://nominatim.openstreetmap.org/search.php?q=${encodeURI(subject)}&polygon_geojson=1&format=jsonv2${lang ? `&accept_language=${lang}` : ''}`;
    return this.searchURL(targetProjection, url, lang);
  }
}

export default NominatimSearch;
