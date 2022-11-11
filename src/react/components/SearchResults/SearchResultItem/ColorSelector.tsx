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

import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Map2Color} from '../../../../style/colors';
import {getSearchUI} from '../../../../di-default';
import {SearchResponse} from '../../../../search';

const searchUI = getSearchUI();

const ColorSelector: React.FunctionComponent<{color: Map2Color, searchResponse: SearchResponse}> = ({color, searchResponse}) => {
  const [selected, setSelected] = useState(false);
  const gotInfo = useRef(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const observable = useMemo(() => searchUI.observableMapUpdateForResponse(searchResponse), [searchResponse.id]);

  useEffect(() => {
    searchUI.isOnMap(searchResponse).then(colorOnMap => {
      setSelected(colorOnMap === color);
      gotInfo.current = true;
    });
    const disposable = observable.subscribe(s => setSelected(s === color));
    return () => disposable.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color, observable]);

  const handleClick = () => {
    if (gotInfo.current) {
      if (selected) {
        searchUI.removeFromMap(searchResponse).then(() => setSelected(false));
      } else {
        searchUI.addToMap(searchResponse, color).then(() => setSelected(true));
      }
    }
  };

  return <div className={`button ${selected ? 'selected' : ''}`} onClick={handleClick}>
    <svg viewBox="0 0 384 512" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 256c-35.3 0-64-28.7-64-64s28.7-64 64-64s64 28.7 64 64s-28.7 64-64 64z"
        fill={color} />
    </svg>
  </div>;
};

export default ColorSelector;
