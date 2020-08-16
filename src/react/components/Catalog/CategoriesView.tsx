import * as React from 'react';
import {useCallback} from 'react';
import {DragDropContext, Draggable, Droppable} from 'react-beautiful-dnd';
import log from '../../../log';
import {getCatalog, getCatalogUI, getWording} from '../../../di-default';
import useObservable from '../../hooks/useObservable';
import CategoryView from './CategoryView';
import CategoryEdit from './CategoryEdit';
import ConfirmDialog from '../Confirm';
import T from '../../../l10n';
import {Categories} from '../../../app-rx/catalog';
import {map} from 'rxjs/operators';

const getClassName = (isDraggingOver: boolean): string => `list${isDraggingOver ? ' dragging-over' : ''}`;

const getDraggingStyle = (isDragging: boolean, draggableStyle: object): object => ({
  // some basic styles to make the items look a bit nicer
  userSelect: 'none',

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
  log.render('Categories')

  const categories = useObservable(catalog.categories.observable()
    .pipe(
      map(cc => Array.from(cc))
    ),
    Array.from(catalog.categories));

  const categoryEdit = useObservable(catalogUI.categoryEditObservable(), catalogUI.categoryEdit);
  const categoryDelete = useObservable(catalogUI.categoryDeleteObservable(), catalogUI.categoryDelete);
  const handleDragEnd = useCallback(
    ({source: {index: indexS}, destination: {index: indexD}}): void => catalog.categories.reorder(indexS, indexD),
    []);
  const handleAdd = useCallback(() => {
    catalog.categories.add(null).then(category => catalogUI.startEditCategory(category))
  }, []);

  return <div className={'folders top'} >
    <DragDropContext onDragEnd={handleDragEnd} >
      <Droppable droppableId="catalog-droppableFolder-top" >
        {(providedDroppable, snapshotDroppable): React.ReactElement => <div
          className={getClassName(snapshotDroppable.isDraggingOver)}
          ref={providedDroppable.innerRef}
        >
          {categories.map((item, index): React.ReactElement =>
            <Draggable draggableId={item.id} index={index} key={item.id} >
              {(provided, snapshot): React.ReactElement => <div
                className={'draggable folder-top'}
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                style={getDraggingStyle(
                  snapshot.isDragging,
                  provided.draggableProps.style
                )}
              >
                <CategoryView canDelete={categories.length > 1} category={item} />
              </div >
              }
            </Draggable >)}
        </div >
        }
      </Droppable >
    </DragDropContext >
    <button className="add" onClick={handleAdd} type="button" >
      {T`Add`}
    </button >
    {categoryEdit && <CategoryEdit category={categoryEdit} />}
    {categoryDelete && <ConfirmDialog
      onConfirm={() => {
        const c = categoryDelete;
        catalogUI.endDeleteCategory();
        catalog.categories.remove(c)
      }}
      onCancel={catalogUI.endDeleteCategory}
      title={wording.C('Delete category')}
      message={wording.CR('Delete category warning')}
      confirm={wording.C('Yes, delete the category')}
    />}
  </div >;
};

export default CategoriesView;
