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
import {FormEvent} from 'react';
import Modal from '../Modal';
import {getCatalogUI, getWording} from '../../../di-default';
import {Route} from '../../../catalog';
import useObservable from '../../hooks/useObservable';
import T from '../../../l10n';
import log from '../../../log';
import {map} from 'rxjs/operators';
import RichTextEditor from '../RichTextEditor';

const catalogUI = getCatalogUI();
const wording = getWording();

const handleSubmit: (ev: FormEvent) => void = (ev: FormEvent) => {
  ev.preventDefault();
  catalogUI.commitEditRoute().then(r => r);
  return null;
};

const handleClose = () => catalogUI.cancelEditRoute();

const RouteEdit: React.FunctionComponent<{ route: Route }> = ({route: routeEdit}): React.ReactElement => {

  const route = useObservable(
    routeEdit
      .observable()
      .pipe(map(r => ({title: r.title, description: r.description})))
    , routeEdit,
  );

  log.render('RouteEdit debug', {route, routeEdit});

  const titleRef = React.useRef<HTMLInputElement>(null);

  React.useEffect((): void => {
    titleRef.current.focus();
    titleRef.current.select();
  }, []);

  return <Modal className="edit-dialog" closeOnEnter onClose={handleClose} >
    <form onSubmit={handleSubmit} >
      <h2 >
        {wording.R('Modify route')}
      </h2 >

      <div className="field-row" >
        <label htmlFor="title" >
          {T`Title`}
        </label >

        <input
          name="title"
          onChange={(ev): void => {
            routeEdit.title = ev.target.value;
          }}
          ref={titleRef}
          value={route.title} />
      </div >

      <div className="field-row" >
        <label htmlFor="description" >
          {T`Description`}
        </label >

        <RichTextEditor
          content={route.description}
          onChange={content => {
            routeEdit.description = content;
          }} />
      </div >

      <div className="buttons-row" >
        <button onClick={handleClose} type="button">
          {T`Close`}
        </button >
      </div >
    </form >
  </Modal >;
};

export default RouteEdit;
