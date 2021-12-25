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
import {DragDropContext, Draggable, DraggingStyle, Droppable, NotDraggingStyle} from 'react-beautiful-dnd';
import log from '../../../log';
import {getCatalogUI, getTools} from '../../../di-default';
import useObservable from '../../hooks/useObservable';
import FeatureView from './FeatureView';
import {FeatureProps, Route, isPoint} from '../../../catalog';
import FeatureEdit from './FeatureEdit';
import ConfirmDialog from '../Confirm';
import T from '../../../l10n';
import {filter, map} from 'rxjs/operators';
import {makeEmptyRichText} from '../../../richtext';

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

const catalogUI = getCatalogUI();
const tools = getTools();

const FeaturesView: React.FunctionComponent<{ route: Route; }> = ({route}): React.ReactElement => {
  log.render(`FeaturesView for ${route.id}`);

  const features = useObservable(
    route.features.observable().pipe(
      filter(f => Boolean(f)),
      map(f => Array.from(f)),
    ),
    Array.from(route.features),
  );
  const featureEdit = useObservable(catalogUI.featureEditObservable(), catalogUI.featureEdit);
  const featureDelete = useObservable(catalogUI.featureDeleteObservable(), catalogUI.featureDelete);
  const handleDragEnd = useCallback(
    ({source: {index: indexS}, destination: {index: indexD}}): void => {
      route.features.reorder(indexS, indexD);
    },
    [route.features],
  );
  const handleAdd = useCallback(() => {
    const newFeature: FeatureProps = {
      style: tools.isPoint ? tools.pointStyle : tools.lineStyle,
      description: makeEmptyRichText(),
      geometry: tools.isPoint
        ? {coordinate: {lat: 0, lon: 0, alt: 0}}
        : {coordinates: [{lat: 0, lon: 0, alt: 0}, {lat: 0, lon: 0, alt: 0}]},
      id: null,
      summary: '',
      title: '',
      visible: true,
    };
    route.features.add(newFeature).then(feature => catalogUI.startEditFeature(feature));
  }, [route.features]);

  return <div className="features" >
    <DragDropContext onDragEnd={handleDragEnd} >
      <Droppable droppableId="catalog-droppableFolder-features" >
        {(providedDroppable, snapshotDroppable): React.ReactElement => <div
          className={getClassName(snapshotDroppable.isDraggingOver)}
          ref={providedDroppable.innerRef}
        >
          {features.map((item, index): React.ReactElement =>
            <Draggable draggableId={item.id} index={index} key={item.id} >
              {(provided, snapshot): React.ReactElement => <div
                className="draggable features"
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                style={getDraggingStyle(
                  snapshot.isDragging,
                  provided.draggableProps.style,
                )}
              >
                <FeatureView feature={item} index={index} route={route} />
              </div >}
            </Draggable >)}
        </div >}
      </Droppable >
    </DragDropContext >

    <button className="add" onClick={handleAdd} type="button" >
      {T`Add`}
    </button >

    {featureEdit && <FeatureEdit feature={featureEdit} />}

    {featureDelete && <ConfirmDialog
      confirm={T`Yes, delete the feature`}
      message={T`The feature will be deleted, are you sure?`}
      onCancel={catalogUI.endDeleteFeature}
      onConfirm={() => {
        const c = featureDelete;
        catalogUI.endDeleteFeature();
        route.features.remove(c.feature);
      }}
      title={isPoint(featureDelete.feature.geometry) ? T`Delete point` : T`Delete line`}
    />}
  </div >;
};

export default FeaturesView;
