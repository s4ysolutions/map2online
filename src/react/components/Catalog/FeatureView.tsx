import * as React from 'react';
import Delete from '../Svg/Delete';
import Hidden from '../Svg/Hidden';
import Prefs from '../Svg/Prefs';
import Visible from '../Svg/Visible';
import {Feature, isPoint, Route} from '../../../app-rx/catalog';
import {getCatalogUI} from '../../../di-default';
import useObservable from '../../hooks/useObservable';
import {map} from 'rxjs/operators';
import log from '../../../log';
import Pin from '../Svg/Pin';
import Line from '../Svg/Line';
import {rgb} from '../../../lib/colors';

const catalogUI = getCatalogUI();

const FeatureView: React.FunctionComponent<{ feature: Feature; route: Route; index: number }> = ({index, feature: featureView, route}): React.ReactElement => {
  log.render('FeatureView');
  const feature = useObservable(featureView.observable(), featureView);

  const isActive = useObservable(
    catalogUI.activeFeatureObservable().pipe(map(active => active.id === feature.id)),
    catalogUI.activeFeature && catalogUI.activeFeature.id === feature.id
  );

  const isVisible = useObservable(catalogUI.visibleObservable(feature.id), catalogUI.isVisible(feature.id));
  const isOpen = useObservable(catalogUI.openObservable(feature.id), catalogUI.isOpen(feature.id));

  const handleDelete = React.useCallback(() => {
    catalogUI.requestDeleteFeature(featureView, route);
  }, []);

  const handleActive = React.useCallback(() => {
    catalogUI.activeFeature = featureView
  }, []);

  const handleOpen = React.useCallback(() => {
    catalogUI.setOpen(featureView.id, !isOpen)
  }, [isOpen]);


  const handleVisible = React.useCallback(() => catalogUI.setVisible(feature.id, !isVisible), [isVisible]);
  const handleEdit = React.useCallback(() => catalogUI.startEditFeature(feature), [feature.id]);

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
            {feature.title && 'No title' /*
            formatCoordinates(toLonLat(
              mapProjection,
              isPointFeature(feature)
                ? feature.geometry.coordinate
                : (feature as LineStringFeature).geometry.coordinates[0]
            ))*/}
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
        {(isPoint(feature.geometry))
          ? <Pin color={rgb[feature.color]} />
          : <Line color={rgb[feature.color]} />
        }
      </div >
    </div >
    {isOpen && <div className="body" >
      aaaa
    </div >}
  </div >;
};

export default FeatureView;
