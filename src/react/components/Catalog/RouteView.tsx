import * as React from 'react';
import Delete from '../Svg/Delete';
import Edit from '../Svg/Edit2';
import Empty from '../Svg/Empty';
import Hidden from '../Svg/Hidden';
import Prefs from '../Svg/Prefs';
import Visible from '../Svg/Visible';
import {Category, Route} from '../../../app-rx/catalog';
import {getCatalogUI} from '../../../di-default';
import useObservable from '../../hooks/useObservable';
import {map} from 'rxjs/operators';
import log from '../../../log';

const noOp = (): null => null;
const catalogUI = getCatalogUI();

const RouteView: React.FunctionComponent<{ route: Route, category: Category, canDelete: boolean }> = ({route: routeView, category, canDelete}): React.ReactElement => {
  log.render('RouteView canDelete ' + canDelete);
  const route = useObservable(routeView.observable(), routeView);

  const isActive = useObservable(
    catalogUI.activeRouteObservable().pipe(map(active => active.id === route.id)),
    catalogUI.activeRoute && catalogUI.activeRoute.id === route.id
  );

  const isVisible = useObservable(catalogUI.visibleObservable(route.id), catalogUI.isVisible(route.id));

  const handleDelete = React.useCallback(() => {
    catalogUI.requestDeleteRoute(routeView, category);
  }, []);

  const handleActive = React.useCallback(() => {
    catalogUI.activeRoute = route
  }, []);


  const handleSelect = React.useCallback(() => {
    catalogUI.selectedRoute = route;
    handleActive()
  }, [category.id, catalogUI.selectedCategory]);
  const handleVisible = React.useCallback(() => catalogUI.setVisible(route.id, !isVisible), [isVisible]);
  const handleEdit = React.useCallback(() => catalogUI.startEditRoute(route), [route.id]);

  return <div className={isActive ? 'item current' : 'item'} >
    <div
      className="delete"
      key="delete"
      onClick={canDelete ? handleDelete : noOp}
    >
      {canDelete ? <Delete /> : <Empty />}
    </div >
    <div className="title" key="title" onClick={handleSelect} >
      {route.title}
    </div >
    <div className="edit" key="edit" onClick={handleEdit} >
      <Prefs />
    </div >
    <div className="active" key="active" onClick={handleActive} >
      <Edit />
    </div >
    <div className="visibility" key="visibility" onClick={handleVisible} >
      {isVisible ? <Visible /> : <Hidden />}
    </div >
  </div >;
};

export default RouteView;
