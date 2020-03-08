import * as React from 'react';
import Delete from '../Svg/Delete';
import Edit from '../Svg/Edit2';
import Hidden from '../Svg/Hidden';
import Prefs from '../Svg/Prefs';
import Visible from '../Svg/Visible';
import {Feature, Route} from '../../../app-rx/catalog';
import {getCatalogUI} from '../../../di-default';
import useObservable from '../../hooks/useObservable';
import {map} from 'rxjs/operators';
import log from '../../../log';

const catalogUI = getCatalogUI();

const FeatureView: React.FunctionComponent<{ feature: Feature, route: Route }> = ({feature: featureView, route}): React.ReactElement => {
  log.render('FeatureView');
  const feature = useObservable(featureView.observable(), featureView);

  const isActive = useObservable(
    catalogUI.activeFeatureObservable().pipe(map(active => active.id === feature.id)),
    catalogUI.activeFeature && catalogUI.activeFeature.id === feature.id
  );

  const isVisible = useObservable(catalogUI.visibleObservable(feature.id), catalogUI.isVisible(feature.id));

  const handleDelete = React.useCallback(() => {
    catalogUI.requestDeleteFeature(featureView, route);
  }, []);

  const handleActive = React.useCallback(() => {
    catalogUI.activeFeature = feature
  }, []);


  const handleVisible = React.useCallback(() => catalogUI.setVisible(feature.id, !isVisible), [isVisible]);
  const handleEdit = React.useCallback(() => catalogUI.startEditFeature(feature), [feature.id]);

  return <div className={isActive ? 'item current' : 'item'} >
    <div
      className="delete"
      key="delete"
      onClick={handleDelete}
    >
      <Delete />
    </div >
    <div className="title" key="title" >
      {feature.title}
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

export default FeatureView;
