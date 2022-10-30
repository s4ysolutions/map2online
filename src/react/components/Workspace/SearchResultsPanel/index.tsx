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

import { motion } from 'framer-motion';
import React from 'react';
import {SearchResponse} from '../../../../search';
import {MID, SMALL} from '../constants';
import log from '../../../../log';
import SearchResults from '../../SearchResults';
import './styles.scss';

const variantSmall = {
  hide: {
    width: 0,
  },
  show: {
    width: '100%',
  },
};

const variantMid = {
  hide: {
    width: 0,
  },
  show: {
    width: '75%',
  },
};

const variantBig = {
  hide: {
    width: 0,
  },
  show: {
    width: '50%',
  },
};

const SearchResultsPanel: React.FunctionComponent<{searchResults: SearchResponse[]}> =
  ({searchResults}): React.ReactElement => {
    const width = document.body.clientWidth;
    log.debug('SearchPanel', searchResults);

    return <motion.div
      animate="show"
      className="search-results-panel"
      variants={width < SMALL ? variantSmall : (width < MID ? variantMid : variantBig)} >
      <SearchResults searchResults={searchResults} />
    </motion.div>;
  };

export default SearchResultsPanel;
