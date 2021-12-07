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
import Edit from '../Svg/Edit2';
import Empty from '../Svg/Empty';
import Hidden from '../Svg/Hidden';
import Prefs from '../Svg/Prefs';
import Visible from '../Svg/Visible';
import {Category, Route} from '../../../catalog';
import {getCatalogUI, getWording} from '../../../di-default';
import useObservable from '../../hooks/useObservable';
import {filter, map} from 'rxjs/operators';
import log from '../../../log';
import T from '../../../l10n';
import {skipConfirmDialog} from '../../../lib/confirmation';
import Active from '../Svg/Active';

const noOp = (): null => null;
const catalogUI = getCatalogUI();
const wording = getWording();

const RouteView: React.FunctionComponent<{ route: Route, category: Category, canDelete: boolean }> = ({route: routeView, category, canDelete}): React.ReactElement => {
  log.render(`RouteView canDelete ${canDelete}`);
  const route = useObservable(
    routeView.observable()
      .pipe(filter(r => Boolean(r))),
    routeView,
  );

  const isActive = useObservable(
    catalogUI.activeRouteObservable().pipe(map(active => active.id === route.id)),
    catalogUI.activeRoute && catalogUI.activeRoute.id === route.id,
  );

  const isVisible = useObservable(routeView.observable().pipe(map(r => r && r.visible)), routeView.visible);

  const handleDelete = React.useCallback(() => {
    if (skipConfirmDialog()) {
      // noinspection JSIgnoredPromiseFromCall
      category.routes.remove(routeView);
    } else {
      catalogUI.requestDeleteRoute(routeView, category);
    }
  }, [category, routeView]);

  const handleActive = React.useCallback(() => {
    catalogUI.activeRoute = routeView;
  }, [routeView]);

  const handleSelect = React.useCallback(() => {
    catalogUI.selectedRoute = routeView;
    handleActive();
  }, [routeView, handleActive]);
  const handleVisible = React.useCallback(() => {
    routeView.visible = !routeView.visible;
  }, [routeView]);
  const handleEdit = React.useCallback(() => catalogUI.startEditRoute(routeView), [routeView]);

  return <div className={isActive ? 'item current' : 'item'} >
    <div
      className="delete"
      key="delete"
      onClick={canDelete ? handleDelete : noOp}
      title={wording.C('Delete route hint')}
    >
      {canDelete ? <Delete /> : <Empty />}
    </div >

    <div
      className="title"
      key="title"
      onClick={handleSelect}
      title={T`Open features`}
    >
      {route.title + (routeView.features.length > 0 && ` (${routeView.features.length})` || ' (0)')}
    </div >

    <div
      className="edit"
      key="edit"
      onClick={handleEdit}
      title={T`Open features`}
    >
      <Edit />
    </div >

    <div
      className="active"
      key="active"
      onClick={handleActive}
      title={wording.R('Activate route hint')}
    >
      <Active />
    </div >

    <div
      className="visibility"
      key="visibility"
      onClick={handleVisible}
      title={wording.C('Visibility route hint')}
    >
      {isVisible ? <Visible /> : <Hidden />}
    </div >
  </div >;
};

export default RouteView;
