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

import * as React from 'react';
import {getCatalogUI, getWording} from '../../../../di-default';
import useObservable from '../../../hooks/useObservable';
import './styles.scss';

const catalogUI = getCatalogUI();
const wording = getWording();

const deselectRoute: () => void = () => {
  catalogUI.selectedRoute = null;
};
const deselectCategory: () => void = () => {
  catalogUI.selectedCategory = null;
  deselectRoute();
};

const CatalogNavigator: React.FunctionComponent = (): React.ReactElement | null => {
  const selectedCategory = useObservable(catalogUI.selectedCategoryObservable(), catalogUI.selectedCategory);
  const selectedRoute = useObservable(catalogUI.selectedRouteObservable(), catalogUI.selectedRoute);

  if (!selectedCategory && !selectedRoute) {
    return null;
  }

  return <div className="catalog-navigator" >
    {selectedCategory ? <button onClick={deselectCategory} type="button" >
      <svg viewBox="0 0 512 512" >
        <path
          d="m260.29 85.236-61.143-62.391h-182.64v482.15h495.48v-419.76zm93.369 218.37-79.495-83.441v205.67h-19.819v-205.67l-79.49 83.441-14.535-13.109 103.93-109.1 103.94 109.1z"
          opacity=".3"
          strokeWidth="2.0366"
        />

        <path
          d="m243.78 69.164-61.143-62.391h-182.64v482.15h495.48v-419.76zm93.369 218.37-79.495-83.441v205.67h-19.819v-205.67l-79.49 83.441-14.535-13.109 103.93-109.1 103.94 109.1z"
          fill="#fff"
          strokeWidth="2.0366"
        />
      </svg >
    </button > : null}

    {!selectedCategory && !selectedRoute && <span className="title" >
      {wording.C('Catalog')}
    </span >}

    {selectedCategory && !selectedRoute ? <span className="title" >
      {selectedCategory.title}
    </span > : null}

    {selectedCategory && selectedRoute ? [
      <button key="button" onClick={deselectRoute} type="button" >
        {selectedCategory.title}
      </button >,
      <span className="title" key="title" >
        {selectedRoute.title}
      </span >,
    ] : null}
  </div >;
};

export default CatalogNavigator;
