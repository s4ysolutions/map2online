import * as React from 'react';
import {useCallback} from 'react';
import {DragDropContext, Draggable, DraggingStyle, Droppable, NotDraggingStyle} from 'react-beautiful-dnd';
import log from '../../../log';
import {getCatalogUI, getWording} from '../../../di-default';
import useObservable from '../../hooks/useObservable';
import RouteView from './RouteView';
import {Category} from '../../../app-rx/catalog';
import RouteEdit from './RouteEdit';
import ConfirmDialog from '../Confirm';
import T from '../../../l10n';
import {map} from 'rxjs/operators';

const getClassName = (isDraggingOver: boolean): string => `list${isDraggingOver ? ' dragging-over' : ''}`;

const getDraggingStyle = (isDragging: boolean, draggableStyle: DraggingStyle | NotDraggingStyle): DraggingStyle | NotDraggingStyle => ({
  // some basic styles to make the items look a bit nicer

  // userSelect: 'none',

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
const wording = getWording();

const RoutesView: React.FunctionComponent<{ category: Category; }> = ({category}): React.ReactElement => {
  log.render('Routes');

  const routes = useObservable(
    category.routes.observable()
      .pipe(map(r => Array.from(r))),
    Array.from(category.routes),
  );
  const routeEdit = useObservable(catalogUI.routeEditObservable(), catalogUI.routeEdit);
  const routeDelete = useObservable(catalogUI.routeDeleteObservable(), catalogUI.routeDelete);
  const handleDragEnd = useCallback(
    ({source: {index: indexS}, destination: {index: indexD}}): void => category.routes.reorder(indexS, indexD),
    [category.routes],
  );
  const handleAdd = useCallback(() => {
    category.routes.add(null).then(route => catalogUI.startEditRoute(route));
  }, [category.routes]);

  return <div className="folders level-1" >
    <DragDropContext onDragEnd={handleDragEnd} >
      <Droppable droppableId="catalog-droppableFolder-level-1" >
        {(providedDroppable, snapshotDroppable): React.ReactElement => <div
          className={getClassName(snapshotDroppable.isDraggingOver)}
          ref={providedDroppable.innerRef}
        >
          {routes.map((item, index): React.ReactElement =>
            <Draggable draggableId={item.id} index={index} key={item.id} >
              {(provided, snapshot): React.ReactElement => <div
                className="draggable folder-level-1"
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                style={getDraggingStyle(
                  snapshot.isDragging,
                  provided.draggableProps.style,
                )}
              >
                <RouteView canDelete={routes.length > 1} category={category} route={item} />
              </div >}
            </Draggable >)}
        </div >}
      </Droppable >
    </DragDropContext >
    <button className="add" onClick={handleAdd} type="button" >
      {T`Add`}
    </button >
    {routeEdit && <RouteEdit route={routeEdit} />}
    {routeDelete && <ConfirmDialog
      confirm={wording.R('Yes, delete the route')}
      message={wording.R('Delete route warning')}
      onCancel={catalogUI.endDeleteRoute}
      onConfirm={() => {
        const c = routeDelete;
        catalogUI.endDeleteRoute();
        category.routes.remove(c.route);
      }}
      title={wording.R('Delete route')}
    />}
  </div >;
};

export default RoutesView;
