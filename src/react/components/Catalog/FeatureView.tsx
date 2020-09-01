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
import Delete from '../Svg/Delete';
import Hidden from '../Svg/Hidden';
import Prefs from '../Svg/Prefs';
import Visible from '../Svg/Visible';
import {Feature, LineString, Route, isPoint} from '../../../app-rx/catalog';
import {getCatalogUI} from '../../../di-default';
import useObservable from '../../hooks/useObservable';
import {filter, map} from 'rxjs/operators';
import log from '../../../log';
import Pin from '../Svg/Pin';
import Line from '../Svg/Line';
import {rgb} from '../../../lib/colors';
import {formatCoordinate, formatCoordinates} from '../../../lib/format';
import {skipConfirmDialog} from '../../../lib/confirmation';

const catalogUI = getCatalogUI();

const FeatureView: React.FunctionComponent<{ feature: Feature; route: Route; index: number }> = ({index, feature: featureView, route}): React.ReactElement => {
  const feature = useObservable(
    featureView.observable()
      .pipe(
        filter(f => Boolean(f)),
        map(f => ({id: f.id, title: f.title, geometry: f.geometry, color: f.color})),
      ),
    featureView,
  );
  log.render('FeatureView', {featureView, feature});

  const isVisible = useObservable(catalogUI.visibleObservable(feature.id), catalogUI.isVisible(feature.id));
  const isOpen = useObservable(catalogUI.openObservable(feature.id), catalogUI.isOpen(feature.id));

  const handleDelete = React.useCallback(() => {
    if (skipConfirmDialog()) {
      route.features.remove(featureView);
    } else {
      catalogUI.requestDeleteFeature(featureView, route);
    }
  }, [featureView, route]);

  const handleOpen = React.useCallback(() => {
    catalogUI.setOpen(featureView.id, !isOpen);
  }, [isOpen, featureView.id]);


  const handleVisible = React.useCallback(() => catalogUI.setVisible(feature.id, !isVisible), [isVisible, feature.id]);
  const handleEdit = React.useCallback(() => catalogUI.startEditFeature(featureView), [featureView]);

  return <div className="accordion-item" >
    <div className="item" >
      <div
        className="delete"
        key="delete"
        onClick={handleDelete}
      >
        <Delete />
      </div >
      <div className="complex-title" key="complex-title" onClick={handleOpen} >
        {[
          <span className="index" key="index" >
            {`${index + 1}.`}
          </span >,
          <div className="title" key="title" >
            {feature.title && feature.title.trim() ||
            `${feature.id} : ${isPoint(feature.geometry)
              ? formatCoordinate(feature.geometry.coordinate)
              : formatCoordinates((feature.geometry as LineString).coordinates)}`}
          </div >,
        ]}
      </div >
      <div className="edit" key="edit" onClick={handleEdit} >
        <Prefs />
      </div >
      <div className="visibility" key="visibility" onClick={handleVisible} >
        {isVisible ? <Visible /> : <Hidden />}
      </div >
      <div className="type" key="type" >
        {isPoint(feature.geometry)
          ? <Pin color={rgb[feature.color]} />
          : <Line color={rgb[feature.color]} />}
      </div >
    </div >
    {isOpen && <div className="body" >
      <div >
        {
          (`${feature.id} : ${isPoint(feature.geometry)
            ? formatCoordinate(feature.geometry.coordinate)
            : formatCoordinates((feature.geometry as LineString).coordinates)}`)
        }
      </div >
    </div >}
  </div >;
};

export default FeatureView;
