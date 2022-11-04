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

import React, {FormEvent, useRef, useState} from 'react';
import {getSearch, getSearchUI} from '../../../di-default';
import './styles.scss';

const searchUI = getSearchUI();
const searchEngine = getSearch();

const MIN_SEARCH_LENGTH = 3;

const SearchControl = (): React.ReactElement => {
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchable, setIsSearchable] = useState(false);

  const search = useRef('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (isSearchable && search.current) {
      setIsSearching(true);
      searchEngine.search(search.current)
        .then(results => {
          searchUI.setResponse(search.current || '', results).then(() => setIsSearching(false));
        })
        .catch((err) => {
          searchUI.setResponse(search.current || '', []);
          setIsSearching(false);
          // eslint-disable-next-line no-alert
          alert(err.message);
        });
    }
    event.preventDefault();
    return false;
  };

  const handleInput = (event: FormEvent<HTMLInputElement>) => {
    const value = event.currentTarget.value;
    if (value && value.length >= MIN_SEARCH_LENGTH) {
      setIsSearchable(true);
      search.current = value;
    } else {
      search.current = '';
      setIsSearchable(false);
    }
  };

  return <form
    className={`search-control ${isSearching ? 'searching' : ''} ${isSearchable ? 'searchable' : ''}`}
    onSubmit={handleSubmit}>
    <input disabled={isSearching} onInput={handleInput} />
  </form>;
};

export default SearchControl;
