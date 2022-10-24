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
import CatalogNavigation from './CatalogNavigation';
import FeaturesView from './FeaturesView';
import {getCatalogUI, getWorkspace} from '../../../di-default';
import useObservable from '../../hooks/useObservable';
import log from '../../../log';
import CategoriesView from './CategoriesView';
import RoutesView from './RoutesView';

const catalog = getCatalogUI();
const workspace = getWorkspace();

const Catalog: React.FunctionComponent = (): React.ReactElement => {
  const openCatalog = useObservable(workspace.catalogObservable(), workspace.catalogOpen);
  const selectedCategory = useObservable(catalog.selectedCategoryObservable(), catalog.selectedCategory);
  const selectedRoute = useObservable(catalog.selectedRouteObservable(), catalog.selectedRoute);
  log.render(`Catalog open=${openCatalog} category=${selectedCategory} route=${selectedRoute}`);

  if (openCatalog) {
    return <div className="catalog" >
      {(selectedCategory && selectedRoute)
        ? <FeaturesView route={selectedRoute} />
        : selectedCategory
          ? <RoutesView category={selectedCategory} />
          : <CategoriesView />}

      <CatalogNavigation />
    </div >;
  }
  return null as unknown as React.ReactElement;
};

export default Catalog;
