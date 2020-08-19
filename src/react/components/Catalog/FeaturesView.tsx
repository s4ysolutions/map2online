import * as React from 'react';
import {useCallback} from 'react';
import {DragDropContext, Draggable, Droppable} from 'react-beautiful-dnd';
import log from '../../../log';
import {getCatalogUI, getTools} from '../../../di-default';
import useObservable from '../../hooks/useObservable';
import FeatureView from './FeatureView';
import {FeatureProps, isPoint, Route} from '../../../app-rx/catalog';
import FeatureEdit from './FeatureEdit';
import ConfirmDialog from '../Confirm';
import T from '../../../l10n';
import {filter, map} from 'rxjs/operators';

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
const tools = getTools()

const FeaturesView: React.FunctionComponent<{ route: Route; }> = ({route}): React.ReactElement => {
  log.render('FeaturesView for ' + route.id);

  const features = useObservable(
    route.features.observable().pipe(
      filter(features => !!features),
      map(features => Array.from(features))
    ),
    Array.from(route.features)
  );
  const featureEdit = useObservable(catalogUI.featureEditObservable(), catalogUI.featureEdit);
  const featureDelete = useObservable(catalogUI.featureDeleteObservable(), catalogUI.featureDelete);
  const handleDragEnd = useCallback(
    ({source: {index: indexS}, destination: {index: indexD}}): void => route.features.reorder(indexS, indexD),
    []);
  const handleAdd = useCallback(() => {
    const newFeature: FeatureProps = {
      color: tools.isPoint ? tools.colorPoint : tools.colorLine,
      description: '',
      geometry: tools.isPoint
        ? {coordinate: {lat: 0, lon: 0, alt: 0}}
        : {coordinates: [{lat: 0, lon: 0, alt: 0}, {lat: 0, lon: 0, alt: 0}]},
      id: null,
      summary: '',
      title: '',
      visible: true,
    }
    route.features.add(newFeature).then(feature => catalogUI.startEditFeature(feature))
  }, []);

  return <div className={'features'} >
    <DragDropContext onDragEnd={handleDragEnd} >
      <Droppable droppableId={'catalog-droppableFolder-features'} >
        {(providedDroppable, snapshotDroppable): React.ReactElement => <div
          className={getClassName(snapshotDroppable.isDraggingOver)}
          ref={providedDroppable.innerRef}
        >
          {features.map((item, index): React.ReactElement =>
            <Draggable draggableId={item.id} index={index} key={item.id} >
              {(provided, snapshot): React.ReactElement => <div
                className={'draggable features'}
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                style={getDraggingStyle(
                  snapshot.isDragging,
                  provided.draggableProps.style
                )}
              >
                <FeatureView index={index} route={route} feature={item} />
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
    {featureEdit && <FeatureEdit feature={featureEdit} />}
    {featureDelete && <ConfirmDialog
      onConfirm={() => {
        const c = featureDelete;
        catalogUI.endDeleteFeature();
        route.features.remove(c.feature);
      }}
      onCancel={catalogUI.endDeleteFeature}
      title={isPoint(featureDelete.feature.geometry) ? T`Delete point` : T`Delete line`}
      message={T`The feature will be deleted, are you sure?`}
      confirm={T`Yes, delete the feature`}
    />}
  </div >;
};

export default FeaturesView;
