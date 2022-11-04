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
import {getCatalog, getCatalogUI, getImportUI, getSearchUI, getWording, getWorkspace} from '../../../di-default';
import useObservable from '../../hooks/useObservable';
import Import from '../Import';
import GoogleMap from '../GoogleMap/GoogleMap';
import Wording from '../Personalization/Wording';
import About from '../About';
import Spinner from '../Spinner';
import useSpinner, {setSpinnerActive} from '../Spinner/hooks/useSpinner';
import SearchResults from './SearchResultsPanel';
import SearchPanel from './SearchPanel';
import OpenLayers from '../OpenLayers';
import {isPoint} from '../../../catalog';
import ConfirmDialog from '../ConfirmDialog';
import T from '../../../l10n';


const importUI = getImportUI();
const visibleObservable = importUI.visibleObservable();

const wording = getWording();
const isPersonalizedObservable = wording.observableIsPersonalized();

const workspace = getWorkspace();
const personalizationObservable = workspace.personalizationObservable();
const aboutObservable = workspace.aboutObservable();

const searchUI = getSearchUI();
const searchObservable = searchUI.observable();

const catalogUI = getCatalogUI();

const catalog = getCatalog();

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
  const featureDelete = useObservable(catalogUI.featureDeleteObservable(), catalogUI.featureDelete);
  const routeDelete = useObservable(catalogUI.routeDeleteObservable(), catalogUI.routeDelete);
  const categoryDelete = useObservable(catalogUI.categoryDeleteObservable(), catalogUI.categoryDelete);

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

          <OpenLayers />
        </div >

        <RightDrawer />

        <FloatPanel parentHeight={height} parentWidth={width} />

      </div >


      {importUIVisible ? <Import /> : null}

      {personalizationVisible ? <Wording /> : null}

      {aboutVisible ? <About /> : null}

      {featureDelete ? <ConfirmDialog
        confirm={T`Yes, delete the feature`}
        message={T`The feature will be deleted, are you sure?`}
        onCancel={catalogUI.endDeleteFeature}
        onConfirm={() => {
          catalogUI.endDeleteFeature();
          setSpinnerActive(true);
          setTimeout(() => {
            const {feature, route} = featureDelete;
            route.features.remove(feature).then(() => {
              setSpinnerActive(false);
            })
              .catch(() => setSpinnerActive(false));
          }, 1);
        }}
        title={isPoint(featureDelete.feature.geometry) ? T`Delete point` : T`Delete line`}
      /> : null}

      {routeDelete ? <ConfirmDialog
        confirm={wording.R('Yes, delete the route')}
        message={wording.R('Delete route warning')}
        onCancel={catalogUI.endDeleteRoute}
        onConfirm={() => {
          catalogUI.endDeleteRoute();
          catalogUI.endDeleteCategory();
          setSpinnerActive(true);
          setTimeout(() => {
            const {category, route} = routeDelete;
            category.routes.remove(route).then(() => {
              setSpinnerActive(false);
            })
              .catch(() => setSpinnerActive(false));
          }, 1);
        }}
        title={wording.R('Delete route')}
      /> : null}

      {categoryDelete ? <ConfirmDialog
        confirm={wording.C('Yes, delete the category')}
        message={wording.CR('Delete category warning')}
        onCancel={catalogUI.endDeleteCategory}
        onConfirm={() => {
          catalogUI.endDeleteCategory();
          setSpinnerActive(true);
          setTimeout(() => {
            catalog.categories.remove(categoryDelete).then(() => {
              setSpinnerActive(false);
            })
              .catch(() => setSpinnerActive(false));
          }, 1);
        }}
        title={wording.C('Delete category')}
      /> : null}

      {spinner ? <Spinner /> : null}
    </React.Fragment >
    : <Wording />;
};

export default React.memo(Workspace);

