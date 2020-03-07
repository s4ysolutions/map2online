import * as React from 'react';
import {DragDropContext, Draggable, Droppable} from 'react-beautiful-dnd';
import FeatureView from './FeatureView';
import {Route} from '../../../app-rx/catalog';
import log from '../../../log';
import {getCatalog, getCatalogUI} from '../../../di-default';
import RouteEdit from './RouteEdit';
import useObservable from '../../hooks/useObservable';

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

const FeaturesView: React.FunctionComponent<{ route: Route }> = ({route}): React.ReactElement => {
  log.render(`Features route=${route.id}`);
  const handleDragEnd = (): void => null;
  const handleAdd = (): void => null;

  const features = useObservable(route.features.observable(), route.features);

  return <div className="features" >
    <DragDropContext onDragEnd={handleDragEnd} >
      <Droppable droppableId="catalog-droppableFeature" >
        {(providedDroppable, snapshotDroppable): React.ReactElement => <div
          className={getClassName(snapshotDroppable.isDraggingOver)}
          ref={providedDroppable.innerRef}
        >
          {Array.from(features).map((item, index): React.ReactElement =>
            <Draggable draggableId={item.id} index={index} key={item.id} >
              {(provided, snapshot): React.ReactElement => <div
                className="draggable feature"
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                style={getDraggingStyle(
                  snapshot.isDragging,
                  provided.draggableProps.style
                )}
              >
                <FeatureView feature={item} index={index} />
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

export default FeaturesView;
