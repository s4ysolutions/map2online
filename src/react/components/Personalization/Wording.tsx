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

import {getWording, getWorkspace} from '../../../di-default';
import * as React from 'react';
import Modal from '../Modal';
import T from '../../../l10n';
import useObservable from '../../hooks/useObservable';
import {FormEvent} from 'react';

const wording = getWording();
const workspace = getWorkspace();

const handleSubmit: (ev: FormEvent) => void = (ev: FormEvent) => {
  ev.preventDefault();
  // noinspection JSIgnoredPromiseFromCall
  workspace.togglePersonalization();
  return null;
};

const Wording = (): React.ReactElement => {
  const categoryVariant = useObservable(wording.observableCurrentCategoryVariant(), wording.currentCategoryVariant);
  const routeVariant = useObservable(wording.observableCurrentRouteVariant(), wording.currentRouteVariant);

  return <Modal className="form" onClose={() => 0} >
    <form onSubmit={handleSubmit} >
      <h2 >
        {T`Personalize wording`}
      </h2 >
      <h3 >
        {T`Choose best category`}
      </h3 >
      <div className="field-row" >
        {wording.categoryVariants.map(category =>
          <div className="radio-row" key={category} >
            <label >
              <input
                checked={category === categoryVariant}
                id={category}
                name="categoryVariant"
                onChange={() => {
                  wording.currentCategoryVariant = category;
                }}
                type="radio"
                value={category}
              />
              &nbsp;
              {category}
            </label >
          </div >)}
      </div >
      <h4 >
        {T`Choose best route`}
      </h4 >
      <div className="field-row" >
        {wording.routeVariants.map(route =>
          <div className="radio-row" key={route} >
            <label >
              <input
                checked={route === routeVariant}
                id={route}
                name="routeVariant"
                onChange={() => {
                  wording.currentRouteVariant = route;
                }}
                type="radio"
                value={route}
              />
              &nbsp;
              {route}
            </label >
          </div >)}
      </div >
      {categoryVariant && routeVariant &&
      <div className="buttons-row" >
        <button onClick={workspace.togglePersonalization} type="button">
          {T`Close`}
        </button >
      </div >}
    </form >
  </Modal >;
};

export default React.memo(Wording);
