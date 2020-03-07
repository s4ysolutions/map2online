import * as React from 'react';
import Delete from '../Svg/Delete';
import Edit from '../Svg/Edit2';
import Empty from '../Svg/Empty';
import Hidden from '../Svg/Hidden';
import Prefs from '../Svg/Prefs';
import Visible from '../Svg/Visible';
import {Route} from '../../../app-rx/catalog';
import {getCatalogUI} from '../../../di-default';
import useObservable from '../../hooks/useObservable';
import {map} from 'rxjs/operators';

const noOp = (): null => null;
const catalogUI = getCatalogUI();

const RouteView: React.FunctionComponent<{ route: Route }> = ({route}): React.ReactElement => {

  const routeState = useObservable(route.observable(), route);

  const isActive = useObservable(
    catalogUI.activeRouteObservable().pipe(map(active => active.id === route.id)),
    catalogUI.activeRoute && catalogUI.activeRoute.id === route.id
  );
  const isSelected = useObservable(
    catalogUI.selectedRouteObservable().pipe(map(selected => selected && selected.id == route.id)),
    catalogUI.selectedRoute && catalogUI.selectedRoute.id === route.id
  );
  const isVisible = useObservable(catalogUI.visibleObservable(route.id), catalogUI.isVisible(route.id));

  const handleActive = React.useCallback(() => {
    catalogUI.activeRoute = route
  }, [route.id]);
  const handleSelect = React.useCallback(() => {
    catalogUI.selectedRoute = route;
    handleActive();
  }, [isSelected, route.id]);
  const canDelete = true;
  const handleDelete = noOp();
  const handleVisible = React.useCallback(() => catalogUI.setVisible(route.id, !isVisible), [isVisible]);
  const handleEdit = React.useCallback(() => catalogUI.startEditRoute(routeState), [routeState.id]);

  return <div className={isActive ? 'item current' : 'item'} >
    <div
      className="delete"
      key="delete"
      onClick={canDelete ? handleDelete : noOp}
    >
      {canDelete ? <Delete /> : <Empty />}
    </div >
    <div className="title" key="title" onClick={handleSelect} >
      {routeState.title}
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
