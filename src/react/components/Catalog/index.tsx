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
import CatalogNavigator from './CatalogNavigator';
import CatalogContent from './CatalogContent';


const Catalog: React.FunctionComponent = (): React.ReactElement => <div className="catalog" >
  <CatalogContent />

  <CatalogNavigator />
</div >;

export default Catalog;
