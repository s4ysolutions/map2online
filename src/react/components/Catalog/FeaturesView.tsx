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
import {DragDropContext, DropResult, Droppable} from 'react-beautiful-dnd';
import log from '../../../log';
import {getCatalogUI, getTools} from '../../../di-default';
import useObservable from '../../hooks/useObservable';
import FeatureView from './FeatureView';
import {FeatureProps, Features, Route, isPoint} from '../../../catalog';
import FeatureEdit from './FeatureEdit';
import ConfirmDialog from '../Confirm';
import T from '../../../l10n';
import {filter, map} from 'rxjs/operators';
import {makeEmptyRichText} from '../../../richtext';
import {ID_NULL} from '../../../lib/id';

const getClassName = (isDraggingOver: boolean): string => `list${isDraggingOver ? ' dragging-over' : ''}`;

const catalogUI = getCatalogUI();
const tools = getTools();

const FeaturesView: React.FunctionComponent<{ route: Route; }> = ({route}): React.ReactElement => {
  log.render(`FeaturesView for ${route.id}`);

  const features = useObservable(
    route.features.observable().pipe(
      filter(f => Boolean(f)),
      map(f => Array.from(f as Features)),
    ),
    Array.from(route.features),
  );
  const featureEdit = useObservable(catalogUI.featureEditObservable(), catalogUI.featureEdit);
  const featureDelete = useObservable(catalogUI.featureDeleteObservable(), catalogUI.featureDelete);
  const handleDragEnd = useCallback(
    (result: DropResult): void => {
      const indexS = result.source.index;
      const indexD = result.destination?.index;
      if (indexD !== undefined) {
        route.features.reorder(indexS, indexD);
      }
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
      id: ID_NULL,
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
            <FeatureView className={index === features.length - 1 ? 'last' : ''} feature={item} index={index} key={item.id} route={route} />)}
        </div >}
      </Droppable >
    </DragDropContext >

    <button className="add" onClick={handleAdd} type="button" >
      {T`Add`}
    </button >

    {featureEdit ? <FeatureEdit feature={featureEdit} /> : null}

    {featureDelete ? <ConfirmDialog
      confirm={T`Yes, delete the feature`}
      message={T`The feature will be deleted, are you sure?`}
      onCancel={catalogUI.endDeleteFeature}
      onConfirm={() => {
        const c = featureDelete;
        catalogUI.endDeleteFeature();
        route.features.remove(c.feature);
      }}
      title={isPoint(featureDelete.feature.geometry) ? T`Delete point` : T`Delete line`}
    /> : null}
  </div >;
};

export default FeaturesView;
