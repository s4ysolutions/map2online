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
import {FormEvent, useCallback} from 'react';
import Modal from '../../UIElements/Modal';
import {getCatalogUI, getWording} from '../../../../di-default';
import {Category} from '../../../../catalog';
import useObservable from '../../../hooks/useObservable';
import T from '../../../../l10n';
import {map} from 'rxjs/operators';
import RichTextEditor from '../../UIElements/RichTextEditor';
import log from '../../../../log';
import {RichText} from '../../../../richtext';
import {Descendant} from 'slate';

const wording = getWording();
const catalogUI = getCatalogUI();
// eslint-disable-next-line no-unused-vars
const handleSubmit: (ev: FormEvent) => void = (ev: FormEvent) => {
  ev.preventDefault();
  // noinspection JSIgnoredPromiseFromCall
  catalogUI.commitEditCategory();
  return null;
};

const handleClose = () => catalogUI.cancelEditCategory();

const FolderLevel1Edit: React.FunctionComponent<{ category: Category }> = ({category: categoryEdit}): React.ReactElement => {
  log.render('CategoryEdit', categoryEdit);

  const category = useObservable(
    categoryEdit.observable()
      .pipe(map(c => ({title: c === null ? '' : c.title, description: c === null ? RichText.makeEmpty() : c.description}))),
    categoryEdit,
  );
  const titleRef = React.useRef<HTMLInputElement>(null);

  React.useEffect((): void => {
    if (titleRef.current !== null) {
      titleRef.current.focus();
      titleRef.current.select();
    }
  }, []);

  const handleChange = useCallback((content: Descendant[]) => {
    categoryEdit.description = content as RichText;
  }, [categoryEdit]);

  return <Modal className="edit-dialog" closeOnEnter onClose={handleClose} >
    <form onSubmit={handleSubmit} >
      <h2 >
        {wording.C('Modify category')}
      </h2 >

      <div className="field-row" >
        <label htmlFor="title" >
          {T`Title`}
        </label >

        <input
          defaultValue={category.title}
          name="title"
          onChange={(ev): void => {
            categoryEdit.title = ev.target.value;
          }}
          ref={titleRef} />
      </div >

      <div className="field-row" >
        <label htmlFor="description" >
          {T`Description`}
        </label >

        <RichTextEditor
          content={category.description}
          onChange={handleChange} />
      </div >

      <div className="buttons-row" >
        <button onClick={handleClose} type="button" >
          {T`Close`}
        </button >
      </div >
    </form >
  </Modal >;
};

export default FolderLevel1Edit;
