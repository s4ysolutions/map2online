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
import {useCallback} from 'react';
import {
  DragDropContext,
  Draggable,
  DraggingStyle,
  DropResult,
  Droppable,
  NotDraggingStyle,
} from 'react-beautiful-dnd';
import log from '../../../log';
import {getCatalog, getCatalogUI, getWording} from '../../../di-default';
import useObservable from '../../hooks/useObservable';
import CategoryView from './CategoryView';
import CategoryEdit from './CategoryEdit';
import ConfirmDialog from '../Confirm';
import T from '../../../l10n';
import {map} from 'rxjs/operators';
import {setSpinnerActive} from '../Spinner/hooks/useSpinner';

const getClassName = (isDraggingOver: boolean): string => `list${isDraggingOver ? ' dragging-over' : ''}`;

const getDraggingStyle = (isDragging: boolean, draggableStyle: DraggingStyle | NotDraggingStyle): DraggingStyle | NotDraggingStyle => ({
  /*
   * some basic styles to make the items look a bit nicer
   * userSelect: 'none',
   */

  /*
   *  padding: grid2,
   * margin: `0 0 ${grid}px 0`,
   */

  /*
   * change background colour if dragging
   * background: isDragging ? 'lightgreen' : 'grey',
   */

  // styles we need to apply on draggables
  ...draggableStyle,
});

const catalog = getCatalog();
const catalogUI = getCatalogUI();
const wording = getWording();

const CategoriesView: React.FunctionComponent = (): React.ReactElement => {
  log.render('Categories');

  const categories = useObservable(
    catalog.categories.observable()
      .pipe(map(cc => cc === null ? [] : Array.from(cc))),
    Array.from(catalog.categories),
  );

  const categoryEdit = useObservable(catalogUI.categoryEditObservable(), catalogUI.categoryEdit);
  const categoryDelete = useObservable(catalogUI.categoryDeleteObservable(), catalogUI.categoryDelete);
  const handleDragEnd = useCallback(
    (result: DropResult): void => {
      const indexS = result.source.index;
      const indexD = result.destination?.index;
      if (indexD !== undefined) {
        catalog.categories.reorder(indexS, indexD);
      }
    },
    [],
  );
  const handleAdd = useCallback(() => {
    catalog.categories.add(null).then(category => catalogUI.startEditCategory(category));
  }, []);

  return <div className="folders top" >
    <DragDropContext onDragEnd={handleDragEnd} >
      <Droppable droppableId="catalog-droppableFolder-top" >
        {(providedDroppable, snapshotDroppable): React.ReactElement => <div
          className={getClassName(snapshotDroppable.isDraggingOver)}
          ref={providedDroppable.innerRef}
        >
          {categories.map((item, index): React.ReactElement =>
            <Draggable draggableId={item.id} index={index} key={item.id} >
              {(provided, snapshot): React.ReactElement => <div
                className="draggable folder-top"
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                style={getDraggingStyle(
                  snapshot.isDragging,
                  provided.draggableProps.style || {},
                )}
              >
                <CategoryView canDelete={categories.length > 1} category={item} isOnly={categories.length === 1} />
              </div >}
            </Draggable >)}
        </div >}
      </Droppable >
    </DragDropContext >

    <button className="add" onClick={handleAdd} type="button" >
      {T`Add`}
    </button >

    {categoryEdit ? <CategoryEdit category={categoryEdit} /> : null}

    {categoryDelete ? <ConfirmDialog
      confirm={wording.C('Yes, delete the category')}
      message={wording.CR('Delete category warning')}
      onCancel={catalogUI.endDeleteCategory}
      onConfirm={() => {
        const c = categoryDelete;
        catalogUI.endDeleteCategory();
        setSpinnerActive(true);
        setTimeout(() => {
          catalog.categories.remove(c).then(() => {
            setSpinnerActive(false);
          })
            .catch(() => setSpinnerActive(false));
        }, 1);
      }}
      title={wording.C('Delete category')}
    /> : null}
  </div >;
};

export default CategoriesView;
