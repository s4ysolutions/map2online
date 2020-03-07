import * as React from 'react';
import {DragDropContext, Draggable, Droppable} from 'react-beautiful-dnd';
import log from '../../../log';
import {getCatalogUI} from '../../../di-default';
import useObservable from '../../hooks/useObservable';
import RouteView from './RouteView';
import {Category} from '../../../app-rx/catalog';
import RouteEdit from './RouteEdit';

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

const catalogUI = getCatalogUI();

const RoutesView: React.FunctionComponent<{ category: Category; }> = ({category}): React.ReactElement => {
  log.render('Routes');

  const routes = useObservable(category.routes.observable(), category.routes);
  const handleDragEnd = (): void => null;
  const handleAdd = (): void => null;
  /*
  catalogUi.startEditFolder(
    level === Level.TOP
      ? catalog.newTopFolder()
      : catalog.newFeaturesFolder(),
    level,
    parent,
  );*/

  return <div className={'folders top'} >
    <DragDropContext onDragEnd={handleDragEnd} >
      <Droppable droppableId={'catalog-droppableFolder-top'} >
        {(providedDroppable, snapshotDroppable): React.ReactElement => <div
          className={getClassName(snapshotDroppable.isDraggingOver)}
          ref={providedDroppable.innerRef}
        >
          {Array.from(routes).map((item, index): React.ReactElement =>
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
                <RouteView route={item} />
              </div >
              }
            </Draggable >)}
        </div >
        }
      </Droppable >
    </DragDropContext >
    <button className="add" onClick={handleAdd} type="button" >
      Add
    </button >
    {catalogUI.routeEdit && <RouteEdit route={catalogUI.routeEdit} />}
  </div >;
};

export default RoutesView;
