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
import {getSearch, getSearchUI} from '../../../../di-default';

const searchUI = getSearchUI();
const search = getSearch();

class SearchControl extends Control {
  private search: HTMLInputElement;
  private form: HTMLFormElement;
  private root: HTMLElement;

  constructor(opt_options?: Options) {
    const options = opt_options || {};

    const search = document.createElement('input');

    const element = document.createElement('form');
    element.className = 'ol-search ol-unselectable ol-control';
    element.appendChild(search);

    super({...options, element});

    this.search = search;
    this.form = element;
    this.root = element;

    this.search.addEventListener('input', this.handleInput.bind(this));
    this.form.addEventListener('submit', this.handleSubmit.bind(this));
  }

  handleInput() {
    if (this.search.value === '') {
      this.root.style.opacity='0.5';
    } else {
      this.root.style.opacity='0.9';
    }
  }

  handleSubmit(ev: Event) {
    if (this.search.value && this.search.value.length > 2) {
      search.search(this.search.value)
        .then(results => searchUI.setResponse(this.search.value, results ))
        .catch((err) => {
          searchUI.setResponse(this.search.value, []);
          alert(err.message);
        });
    }
    ev.preventDefault();
    return false;
  }
}

export default SearchControl;
