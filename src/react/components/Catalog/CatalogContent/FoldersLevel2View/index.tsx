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
import {useCallback} from 'react';
import log from '../../../../../log';
import {getCatalogUI} from '../../../../../di-default';
import useObservable from '../../../../hooks/useObservable';
import FolderLevel2View from './FolderLevel2View';
import {Category} from '../../../../../catalog';
import {map} from 'rxjs/operators';
import DragDropList from '../../../UIElements/DragDropList';
import DragDropItem from '../../../UIElements/DragDropList/DragDropItem';
import AddButton from '../AddButton';
import './styles.scss';

const catalogUI = getCatalogUI();

const FoldersLevel2View: React.FunctionComponent<{ category: Category; }> = ({category}): React.ReactElement => {
  log.render('Routes');

  const routes = useObservable(
    category.routes.observable()
      .pipe(map(r => r === null ? [] : Array.from(r))),
    Array.from(category.routes),
  );
  const handleDragEnd = useCallback(
    (indexS: number, indexD: number | null): void => {
      if (indexD !== null) {
        category.routes.reorder(indexS, indexD);
      }
    },
    [category.routes],
  );
  const handleAdd = useCallback(() => {
    category.routes.add(null).then(route => catalogUI.startEditRoute(route));
  }, [category.routes]);

  return <div className="catalog-content folders level-2" >
    <DragDropList droppableId="droppable-folders-level2" onDragEnd={handleDragEnd} >
      {routes.map((item, index): React.ReactElement =>
        <DragDropItem id={item.id} index={index} key={item.id} >
          <FolderLevel2View canDelete={routes.length > 1} category={category} isOnly={routes.length === 1} route={item} />
        </DragDropItem >)}
    </DragDropList >

    <AddButton onAdd={handleAdd} />
  </div >;
};

export default FoldersLevel2View;
