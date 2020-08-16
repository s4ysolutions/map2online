import * as React from 'react';
import Delete from '../Svg/Delete';
import Edit from '../Svg/Edit2';
import Empty from '../Svg/Empty';
import Hidden from '../Svg/Hidden';
import Prefs from '../Svg/Prefs';
import Visible from '../Svg/Visible';
import {Category, Route} from '../../../app-rx/catalog';
import {getCatalogUI, getWording} from '../../../di-default';
import useObservable from '../../hooks/useObservable';
import {filter, map} from 'rxjs/operators';
import log from '../../../log';
import T from '../../../l10n';
import {skipConfirmDialog} from '../../../lib/confirmation';

const noOp = (): null => null;
const catalogUI = getCatalogUI();
const wording = getWording();

const RouteView: React.FunctionComponent<{ route: Route, category: Category, canDelete: boolean }> = ({route: routeView, category, canDelete}): React.ReactElement => {
  log.render('RouteView canDelete ' + canDelete);
  const route = useObservable(routeView.observable()
    .pipe(
      filter(r => !!r)
    ),
    routeView)

  const isActive = useObservable(
    catalogUI.activeRouteObservable().pipe(map(active => active.id === route.id)),
    catalogUI.activeRoute && catalogUI.activeRoute.id === route.id
  );

  const isVisible = useObservable(catalogUI.visibleObservable(route.id), catalogUI.isVisible(route.id));

  const handleDelete = React.useCallback(() => {
    if (skipConfirmDialog()) {
      category.routes.remove(route);
    } else {
      catalogUI.requestDeleteRoute(routeView, category);
    }
  }, []);

  const handleActive = React.useCallback(() => {
    catalogUI.activeRoute = route
  }, []);

  const handleSelect = React.useCallback(() => {
    catalogUI.selectedRoute = route;
    handleActive()
  }, [route.id]);
  const handleVisible = React.useCallback(() => catalogUI.setVisible(route.id, !isVisible), [isVisible]);
  const handleEdit = React.useCallback(() => catalogUI.startEditRoute(route), [route.id]);

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
      {route.title}
    </div >
    <div
      className="edit"
      key="edit"
      onClick={handleEdit}
      title={T`Open features`}
    >
      <Prefs />
    </div >
    <div
      className="active"
      key="active"
      onClick={handleActive}
      title={wording.R('Activate route hint')}
    >
      <Edit />
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
