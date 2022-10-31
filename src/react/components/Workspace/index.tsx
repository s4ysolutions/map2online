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
import log from '../../../log';
import useComponentSize from '../../hooks/useComponentSize';
import TopNavigationPanel from './TopNavigationPanel';
import FloatPanel from './FloatPanel';
import LeftDrawer from './LeftDrawer';
import RightDrawer from './RightDrawer';
import {getImportUI, getSearchUI, getWording, getWorkspace} from '../../../di-default';
import useObservable from '../../hooks/useObservable';
import Import from '../Import';
import GoogleMap from '../GoogleMap/GoogleMap';
import Wording from '../Personalization/Wording';
import About from '../About';
import Spinner from '../Spinner';
import useSpinner from '../Spinner/hooks/useSpinner';
import SearchResults from './SearchResultsPanel';
import SearchPanel from './SearchPanel';
import OlMap from '../Ol/OlMap';


const importUI = getImportUI();
const visibleObservable = importUI.visibleObservable();

const wording = getWording();
const isPersonalizedObservable = wording.observableIsPersonalized();

const workspace = getWorkspace();
const personalizationObservable = workspace.personalizationObservable();
const aboutObservable = workspace.aboutObservable();

const searchUI = getSearchUI();
const searchObservable = searchUI.observable();

const Workspace = (): React.ReactElement => {
  const [el, setEl] = useState<HTMLDivElement | null>(null);
  const onRefSet = useCallback((ref: HTMLDivElement) => {
    setEl(ref);
  }, [setEl]);
  const {height, width} = useComponentSize(el);
  const importUIVisible = useObservable<boolean>(visibleObservable, importUI.visible);
  const isPersonalized = useObservable(isPersonalizedObservable, wording.isPersonalized);
  const personalizationVisible = useObservable<boolean>(personalizationObservable, workspace.personalizationOpen);
  const aboutVisible = useObservable<boolean>(aboutObservable, workspace.aboutOpen);
  const searchResults = useObservable(searchObservable, []);

  const spinner = useSpinner();
  log.render(`Workspace spiner=${spinner}`);

  return isPersonalized
    ? <React.Fragment >
      <TopNavigationPanel key="topNavigationPanel" />

      <div className="workspace" key="workspace" ref={onRefSet} >
        <SearchPanel />

        {searchResults.length > 0 ? <SearchResults searchResults={searchResults} /> : null}

        <LeftDrawer />

        <div className="map-container" >
          <GoogleMap />

          <OlMap />
        </div >

        <RightDrawer />

        <FloatPanel parentHeight={height} parentWidth={width} />

      </div >


      {importUIVisible ? <Import /> : null}

      {personalizationVisible ? <Wording /> : null}

      {aboutVisible ? <About /> : null}


      {spinner ? <Spinner /> : null}
    </React.Fragment >
    : <Wording />;
};

export default React.memo(Workspace);

