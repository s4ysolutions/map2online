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
import {SearchResponse} from '../../../../search';
import log from '../../../../log';
import {map2colors} from '../../../../style/colors';
import ColorSelector from './ColorSelector';

const SearchResult: React.FunctionComponent<{searchResponse: SearchResponse}> = ({searchResponse}): React.ReactElement => {
  log.render('SearchResult', searchResponse);
  return <div className="item">
    {searchResponse.id}

    {searchResponse.type}

    {JSON.stringify(searchResponse.address)}

    <div className="colors">
      {Object.entries(map2colors).map(([id, color]) =>
        <ColorSelector color={color} key={id} searchResponse={searchResponse} />)}
    </div>
  </div>;
};

export default SearchResult;
