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
import log from '../../../../../log';
import {getCatalogUI, getTools} from '../../../../../di-default';
import useObservable from '../../../../hooks/useObservable';
import FeatureView from './FeatureView';
import {FeatureProps, Features, Route} from '../../../../../catalog';
import {filter, map} from 'rxjs/operators';
import {RichText} from '../../../../../richtext';
import {ID_NULL} from '../../../../../lib/id';
import AddButton from '../AddButton';
import DragDropList from '../../../UIElements/DragDropList';
import DragDropItem from '../../../UIElements/DragDropList/DragDropItem';
import './styles.scss';

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

  const handleDragEnd = useCallback(
    (indexS: number, indexD: number | null): void => {
      if (indexD !== null) {
        route.features.reorder(indexS, indexD);
      }
    },
    [route.features],
  );

  const handleAdd = useCallback(() => {
    const newFeature: FeatureProps = {
      style: tools.isPoint ? tools.pointStyle : tools.lineStyle,
      description: RichText.makeEmpty(),
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

  return <div className="catalog-content features" >
    <DragDropList droppableId="droppable-features" onDragEnd={handleDragEnd} >
      {features.map((item, index): React.ReactElement =>
        <DragDropItem id={item.id} index={index} key={item.id} >
          <FeatureView
            feature={item}
            index={index}
            isLast={index === features.length - 1}
            key={item.id}
            route={route} />
        </DragDropItem >)}
    </DragDropList >

    <AddButton onAdd={handleAdd} />

  </div >;
};

export default FeaturesView;
