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
import CatalogButton from './CatalogButton';
import MenuButton from './MenuButton';
import T from 'l10n';
import {getCatalogUI, getImportUI, getWorkspace} from '../../../../di-default';
import log from '../../../../log';
import useObservable from '../../../hooks/useObservable';

const importUI = getImportUI();
const workspace = getWorkspace();
const catalogUI = getCatalogUI();

const deselectRoute = (): void => {
  catalogUI.selectedRoute = null;
};

const deselectCategory = () => {
  catalogUI.selectedCategory = null;
  deselectRoute();
};

const openImport = (): void => {
  workspace.closeMenus();
  importUI.open();
};

const TopNavigation = (): React.ReactElement => {
  log.render('TopNavigation');
  const selectedCategory = useObservable(catalogUI.selectedCategoryObservable(), catalogUI.selectedCategory);
  const selectedRoute = useObservable(catalogUI.selectedRouteObservable(), catalogUI.selectedRoute);

  return <div className="top-navigation" >
    <CatalogButton />

    <h1 >
      <span className={selectedCategory ? 'hasPointer' : ''} onClick={deselectCategory} >
        {T`AppTitle`}
      </span >

      {selectedCategory ? <span
        className={selectedRoute ? 'hasPointer' : ''}
        onClick={deselectRoute} >
        {` - ${selectedCategory.title}`}
      </span > : ''}

      {selectedRoute ? ` - ${selectedRoute.title}` : ''}
    </h1 >

    <MenuButton onClick={workspace.toggleSettings} title={T`Settings`} />

    <MenuButton onClick={openImport} title={T`Import menu`} />

    <MenuButton onClick={workspace.toggleExport} title={T`Export menu`} />

    <MenuButton onClick={workspace.toggleSources} title={T`Sources`} />

    <MenuButton onClick={workspace.toggleAbout} title={T`About`} />
  </div >;
};

export default TopNavigation;
