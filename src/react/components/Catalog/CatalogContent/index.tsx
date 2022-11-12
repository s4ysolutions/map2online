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
import {getCatalogUI} from '../../../../di-default';
import useObservable from '../../../hooks/useObservable';
import FeaturesView from './FeaturesView';
import FoldersLevel2View from './FoldersLevel2View';
import FoldersLevel1View from './FoldersLevel1View';
import './styles.scss';

const catalog = getCatalogUI();

const CatalogContent: React.FunctionComponent = (): React.ReactElement => {
  const selectedCategory = useObservable(catalog.selectedCategoryObservable(), catalog.selectedCategory);
  const selectedRoute = useObservable(catalog.selectedRouteObservable(), catalog.selectedRoute);

  return (selectedCategory && selectedRoute)
    ? <FeaturesView route={selectedRoute} />
    : selectedCategory
      ? <FoldersLevel2View category={selectedCategory} />
      : <FoldersLevel1View />;
};

export default CatalogContent;
