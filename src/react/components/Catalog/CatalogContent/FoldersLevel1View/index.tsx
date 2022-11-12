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
import {getCatalog, getCatalogUI} from '../../../../../di-default';
import useObservable from '../../../../hooks/useObservable';
import FolderLevel1View from './FolderLevel1View';
import {map} from 'rxjs/operators';
import AddButton from '../AddButton';
import DragDropList from '../../../UIElements/DragDropList';
import DragDropItem from '../../../UIElements/DragDropList/DragDropItem';
import './styles.scss';

const catalog = getCatalog();
const catalogUI = getCatalogUI();

const FoldersLevel1View: React.FunctionComponent = (): React.ReactElement => {

  const categories = useObservable(
    catalog.categories.observable()
      .pipe(map(cc => cc === null ? [] : Array.from(cc))),
    Array.from(catalog.categories),
  );

  const handleAdd = useCallback(() => {
    catalog.categories.add(null).then(category => catalogUI.startEditCategory(category));
  }, []);

  const handleDragEnd = useCallback(
    (indexS: number, indexD: number | null): void => {
      if (indexD !== null) {
        catalog.categories.reorder(indexS, indexD);
      }
    },
    [],
  );

  return <div className="catalog-content folders level-1" >
    <DragDropList droppableId="droppable-folders-level1" onDragEnd={handleDragEnd}>
      {categories.map((item, index): React.ReactElement =>
        <DragDropItem id={item.id} index={index} key={item.id} >
          <FolderLevel1View canDelete={categories.length > 1} category={item} isOnly={categories.length === 1} />
        </DragDropItem >)}
    </DragDropList >

    <AddButton onAdd={handleAdd} />

  </div >;
};

export default FoldersLevel1View;
