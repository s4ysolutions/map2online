/*
 * Copyright 2019 s4y.solutions
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import './styles.scss';
import * as React from 'react';
import {useCallback, useState} from 'react';
import useComponentSize from '../../hooks/useComponentSize';
import TopNavigationPanel from './TopNavigationPanel';
import FloatPanel from './FloatPanel';
import LeftDrawer from './LeftDrawer';
import RightDrawer from './RightDrawer';
import {getSearchUI, getWording} from '../../../di-default';
import useObservable from '../../hooks/useObservable';
import GoogleMap from '../GoogleMap/GoogleMap';
import Wording from '../Personalization/Wording';
import SearchResults from './SearchResultsPanel';
import SearchPanel from './SearchPanel';
import OpenLayers from '../OpenLayers';

const wording = getWording();
const isPersonalizedObservable = wording.observableIsPersonalized();


const searchUI = getSearchUI();
const searchObservable = searchUI.observable();

const Workspace = (): React.ReactElement => {
  const [el, setEl] = useState<HTMLDivElement | null>(null);
  const onRefSet = useCallback((ref: HTMLDivElement) => {
    setEl(ref);
  }, [setEl]);
  const {height, width} = useComponentSize(el);
  const isPersonalized = useObservable(isPersonalizedObservable, wording.isPersonalized);
  const searchResults = useObservable(searchObservable, []);

  return isPersonalized
    ? <React.Fragment >
      <TopNavigationPanel key="topNavigationPanel" />

      <div className="workspace" key="workspace" ref={onRefSet} >
        <SearchPanel />

        {searchResults.length > 0 ? <SearchResults searchResults={searchResults} /> : null}

        <LeftDrawer />

        <div className="map-container" >
          <GoogleMap />

          <OpenLayers />
        </div >

        <RightDrawer />

        <FloatPanel parentHeight={height} parentWidth={width} />

      </div >

    </React.Fragment >
    : <Wording />;
};

export default React.memo(Workspace);

