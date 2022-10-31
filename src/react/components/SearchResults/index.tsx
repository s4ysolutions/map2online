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

import React from 'react';
import {SearchResponse} from '../../../search';
import log from '../../../log';
import './styles.scss';
import Index from './SearchResult';

const SearchResults: React.FunctionComponent<{searchResults: SearchResponse[]}> =
  ({searchResults}): React.ReactElement => {
    log.debug('SearchResults', searchResults);

    return <div className="search-results" >
      {searchResults.map(searchResult => <Index key={searchResult.id} searchResponse={searchResult} />)}
    </div>;
  };

export default SearchResults;
