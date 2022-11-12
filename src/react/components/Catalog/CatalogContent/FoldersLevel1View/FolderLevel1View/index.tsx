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
import Delete from '../../../../Svg/Delete';
import Edit from '../../../../Svg/Edit2';
import Empty from '../../../../Svg/Empty';
import Hidden from '../../../../Svg/Hidden';
import Visible from '../../../../Svg/Visible';
import {Category} from '../../../../../../catalog';
import {getCatalog, getCatalogUI, getWording} from '../../../../../../di-default';
import useObservable from '../../../../../hooks/useObservable';
import {filter, map} from 'rxjs/operators';
import log from '../../../../../../log';
import {skipConfirmDialog} from '../../../../../../lib/confirmation';
import Active from '../../../../Svg/Active';
import './styles.scss';

interface Props {
  isOnly: boolean;
  canDelete: boolean;
  category: Category;
}

const noOp = (): null => null;
const catalog = getCatalog();
const catalogUI = getCatalogUI();
const wording = getWording();

const FolderLevel1View: React.FunctionComponent<Props> =
  ({isOnly, canDelete, category: categoryView}): React.ReactElement => {

    const category = useObservable(
      categoryView.observable().pipe(
        filter(v => Boolean(v)),
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        map(c => ({title: c!.title, id: c!.id, routes: c!.routes})),
      ), // don't rerender on deleteted category
      categoryView,
    );

    const isActive: boolean = useObservable(
      catalogUI.activeCategoryObservable().pipe(map(active => active?.id === category?.id)),
      catalogUI.activeCategory?.id === category?.id,
    );

    const isVisible = useObservable(categoryView.observable().pipe(map((c: Category | null) => c && c.visible)), categoryView.visible);

    const handleDelete = React.useCallback(
      () => {
        if (category !== null && skipConfirmDialog()) {
          // noinspection JSIgnoredPromiseFromCall
          catalog.categories.remove(categoryView);
        } else {
          catalogUI.requestDeleteCategory(categoryView);
        }
      },
      [category, categoryView],
    );

    const handleActive = React.useCallback(
      () => {
        if (category?.routes) {
          if (!isActive && category.routes.length > 0) {
            catalogUI.activeRoute = category.routes.byPos(0);
          }
        }
      },
      [isActive, category?.routes],
    );

    const handleSelect = React.useCallback(() => {
      catalogUI.selectedCategory = categoryView;
      handleActive();
    }, [categoryView, handleActive]);

    const handleVisible = React.useCallback(() => {
      categoryView.visible = !categoryView.visible;
    }, [categoryView]);

    const handleEdit = React.useCallback(
      () => catalogUI.startEditCategory(categoryView),
      [categoryView],
    );

    return <div className={`folder level-1 ${isActive ? 'current' : ''}`} >
      <div
        className="delete"
        key="delete"
        onClick={canDelete ? handleDelete : noOp}
        title={wording.C('Delete category hint')}
      >
        {canDelete ? <Delete /> : <Empty />}
      </div >

      <div
        className="title"
        key="title"
        onClick={handleSelect}
        title={wording.CR('Open category hint')}
      >
        {(category?.title || '') + (categoryView.routes.length > 0 && ` (${categoryView.routes.length})` || ' (0)')}
      </div >

      <div
        className="edit"
        key="edit"
        onClick={handleEdit}
        title={wording.C('Modify category hint')}
      >
        <Edit />
      </div >

      {isOnly ? null : <div
        className="active"
        key="active"
        onClick={handleActive}
        title={wording.C('Activate category hint')}
      >
        <Active />
      </div >}

      <div
        className="visibility"
        key="visibility"
        onClick={handleVisible}
        title={wording.C(isVisible ? 'Visibility off category hint' : 'Visibility on category hint')}
      >
        {isVisible ? <Visible /> : <Hidden />}
      </div >
    </div >;
  };

export default FolderLevel1View;
