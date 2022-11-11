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

/* eslint-disable */
import {Control} from 'ol/control';
import {Options} from 'ol/control/Control';
import {transformExtent} from 'ol/proj';
import {getSearch, getSearchUI} from '../../../../../di-default';
import './search-control.scss';
import {MID} from '../../../Workspace/constants';
import {currentLocale} from '../../../../../l10n';
import {SearchResponse} from '../../../../../search';

const searchUI = getSearchUI();
const search = getSearch();

const hasOffsetWidth = (element: HTMLElement | string | undefined): element is HTMLElement =>
  element !== undefined && (element as HTMLElement).offsetWidth !== undefined;


class SearchControl extends Control {
  private search: HTMLInputElement;
  private form: HTMLFormElement;
  private root: HTMLElement;
  private searchable = false;
  private searching = false;

  constructor(opt_options?: Options) {
    const options = opt_options || {};

    const search = document.createElement('input');
    const run = document.createElement('div')
    run.className = 'run-search';

    const searchArea = document.createElement('div')
    searchArea.className = 'search-area-switch';
    searchArea.classList.add(searchUI.limitSearchToVisibleArea ? 'limit' : 'no-limit')

    const form = document.createElement('form');
    form.appendChild(run);
    form.appendChild(search);
    form.appendChild(searchArea);

    super({...options, element: form});

    this.search = search;
    this.form = form;
    this.root = form;

    this.form.className = 'ol-search ol-unselectable ol-control';

    this.search.addEventListener('input', this.handleInput.bind(this));
    this.form.addEventListener('submit', this.handleSubmit.bind(this));
    run.addEventListener('click',() => {
      this.form.dispatchEvent(new CustomEvent('submit', {cancelable: true}));
    });
    searchArea.addEventListener('click', () => {
      searchUI.limitSearchToVisibleArea = !searchUI.limitSearchToVisibleArea;
      searchArea.classList.remove('no-limit')
      searchArea.classList.remove('limit')
      searchArea.classList.add(searchUI.limitSearchToVisibleArea ? 'limit' : 'no-limit')
    })
  }

  setSearchable() {
    this.searchable = false;
    this.root.classList.remove('searchable')
  }

  unsetSearchable() {
    this.searchable = true;
    this.root.classList.add('searchable')
  }

  handleInput() {
    if (this.search.value && this.search.value.length > 2) {
      this.unsetSearchable();
    } else {
      this.setSearchable()
    }
  }

  handleSubmit(ev: Event) {
    const map = this.getMap();
    if (map !== null && this.searchable) {
      this.root.classList.add('searching')
      this.search.disabled = true;

      let searchPromise: Promise<SearchResponse[]>

      if (searchUI.limitSearchToVisibleArea) {
        const mapExtent = map.getView().calculateExtent();
        const extent = transformExtent(mapExtent, map.getView().getProjection(), search.projection);

        const mapElement = map.getTarget();
        const width = (hasOffsetWidth(mapElement))
          ? mapElement.offsetWidth
          : 0;

        const top = extent[3];
        const bottom = extent[1];
        const left = extent[0];
        // left half to be covered by search result list on big screen
        const right = width > MID ? left + (extent[2] - left) / 2 : extent[2];
        searchPromise = search.searchWithinArea(
          map.getView().getProjection().getCode(),
          this.search.value, left, bottom, right, top, currentLocale())
      } else {
        searchPromise = search.search(map.getView().getProjection().getCode(), this.search.value, currentLocale())
      }

      searchPromise.then(results => {
          searchUI.setResponse(this.search.value, results).then(() => searchUI.showResponse = true);
          this.root.classList.remove('searching')
          this.search.disabled = false;
        })
        .catch((err) => {
          searchUI.setResponse(this.search.value, []);
          this.root.classList.remove('searching')
          this.search.disabled = false;
          alert(err.message);
        });
    }
    ev.preventDefault();
    return false;
  }
}

export default SearchControl;
