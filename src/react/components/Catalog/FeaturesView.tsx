import * as React from 'react';
import {useCallback} from 'react';
import {DragDropContext, Draggable, Droppable} from 'react-beautiful-dnd';
import log from '../../../log';
import {getCatalogUI} from '../../../di-default';
import useObservable from '../../hooks/useObservable';
import FeatureView from './FeatureView';
import {Route} from '../../../app-rx/catalog';
import FeatureEdit from './FeatureEdit';
import ConfirmDialog from '../Confirm';
import T from '../../../l10n';

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

const FeaturesView: React.FunctionComponent<{ route: Route; }> = ({route}): React.ReactElement => {
  log.render('Features');

  const features = useObservable(route.features.observable(), route.features);
  const featureEdit = useObservable(catalogUI.featureEditObservable(), catalogUI.featureEdit);
  const featureDelete = useObservable(catalogUI.featureDeleteObservable(), catalogUI.featureDelete);
  const handleDragEnd = useCallback(
    ({source: {index: indexS}, destination: {index: indexD}}): void => features.reorder(indexS, indexD),
    []);
  const handleAdd = useCallback(() => {
    route.features.add(null).then(feature => catalogUI.startEditFeature(feature))
  }, []);

  return <div className={'folders top'} >
    <DragDropContext onDragEnd={handleDragEnd} >
      <Droppable droppableId={'catalog-droppableFolder-top'} >
        {(providedDroppable, snapshotDroppable): React.ReactElement => <div
          className={getClassName(snapshotDroppable.isDraggingOver)}
          ref={providedDroppable.innerRef}
        >
          {Array.from(features).map((item, index): React.ReactElement =>
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
                <FeatureView route={route} feature={item} />
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
    {featureEdit && <FeatureEdit feature={featureEdit} />}
    {featureDelete && <ConfirmDialog
      onConfirm={() => {
        const c = featureDelete;
        catalogUI.endDeleteFeature();
        route.features.remove(c.feature);
      }}
      onCancel={catalogUI.endDeleteFeature}
      title={T`Delete feature`}
      message={T`The feature and all the features inside it will be deleted, are you sure?`}
      confirm={T`Yes, delete the feature`}
    />}
  </div >;
};

export default FeaturesView;
