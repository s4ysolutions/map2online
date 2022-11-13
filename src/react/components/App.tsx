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

import * as React from 'react';
import {useEffect} from 'react';
import Workspace from './Workspace';
import useObservable from '../hooks/useObservable';
import {getCatalogUI} from '../../di-default';
import T from 'l10n';
import useSpinner from './UIElements/Spinner/hooks/useSpinner';
import './styles.scss';
import Spinner from './UIElements/Spinner';
import Modals from './Modals';

const catalogUI = getCatalogUI();

// eslint-disable-next-line @typescript-eslint/no-empty-function
const callback = () => {
};

const App: React.FunctionComponent = (): React.ReactElement => {
  const selectedCategory = useObservable(catalogUI.selectedCategoryObservable(), catalogUI.selectedCategory);
  const selectedRoute = useObservable(catalogUI.selectedRouteObservable(), catalogUI.selectedRoute);

  useEffect(() => {
    if (selectedCategory && selectedRoute) {
      window.document.title = `${T`AppTitle`} - ${selectedCategory.title} - ${selectedRoute.title}`;
    } else if (selectedCategory) {
      window.document.title = `${T`AppTitle`} - ${selectedCategory.title}`;
    } else {
      window.document.title = T`AppTitle`;
    }
  }, [selectedRoute, selectedCategory]);

  const spinner = useSpinner();

  return <React.Profiler id="App" onRender={callback} >
    <React.StrictMode >
      <div className="application" >
        <Workspace />

        <Modals />

        {spinner ? <Spinner /> : null}
      </div >
    </React.StrictMode >
  </React.Profiler >;
};

export default App;
