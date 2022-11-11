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

// import { motion } from 'framer-motion';
import React from 'react';
// import {MID, SMALL} from '../constants';
import SearchResults from '../../SearchResults';
import './styles.scss';
import {getSearchUI} from '../../../../di-default';
import useObservable from '../../../hooks/useObservable';
/*
const variantSmall = {
  hide: {
    left: '100%',
    bottom: 0,
  },
  show: {
    left: '8px',
    bottom: '50%',
  },
};

const variantMid = {
  hide: {
    left: '16px',
    bottom: 0,
  },
  show: {
    left: '25%',
    bottom: '50%',
  },
};

const variantBig = {
  hide: {
    left: '100%',
    bottom: 0,
  },
  show: {
    left: '50%',
    bottom: '8px',
  },
};
*/
const searchUI = getSearchUI();
const searchObservable = searchUI.observable();
const showObservable = searchUI.observableShowResponse();

const SearchResultsPanel: React.FunctionComponent = (): React.ReactElement | null => {
  //    const width = document.body.clientWidth;

  const searchResults = useObservable(searchObservable, []);
  const show = useObservable(showObservable, searchUI.showResponse);

  if (!(searchResults && show)) {
    return null;
  }
  /*
  return <motion.div
    animate="show"
    className="search-results-panel"
    variants={width < SMALL ? variantSmall : (width < MID ? variantMid : variantBig)} >
    <SearchResults searchResults={searchResults} />
  </motion.div>;
  */
  return <div className="search-results-panel" >
    <SearchResults searchResults={searchResults} />
  </div >;
};

export default SearchResultsPanel;
