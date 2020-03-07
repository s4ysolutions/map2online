import * as React from 'react';
import Delete from '../Svg/Delete';
import Hidden from '../Svg/Hidden';
import Line from '../Svg/Line';
import Pin from '../Svg/Pin';
import Prefs from '../Svg/Prefs';
import Visible from '../Svg/Visible';
import {Feature, isPoint} from '../../../app-rx/catalog';
import {getCatalogUI} from '../../../di-default';
import useObservable from '../../hooks/useObservable';
import {rgb} from '../../../lib/colors';
import T from '../../../l10n';

const noOp = (): null => null;
const catalogUI = getCatalogUI();

// eslint-disable-next-line max-lines-per-function
const FeatureView: React.FunctionComponent<{ feature: Feature, index: number }> = ({feature, index}): React.ReactElement => {

  const featureState = useObservable(feature.observable(), feature);

  const isOpen = useObservable(catalogUI.openObservable(featureState.id), catalogUI.isOpen(feature.id));
  const isVisible = useObservable(catalogUI.visibleObservable(featureState.id), catalogUI.isVisible(feature.id));

  const handleDelete = noOp();
  const handleVisible = React.useCallback(() => catalogUI.setVisible(feature.id, !isVisible), [isVisible]);
  const handleOpen = React.useCallback(() => catalogUI.setOpen(feature.id, !isOpen), [isOpen]);
  const handleEdit = React.useCallback(() => catalogUI.startEditFeature(featureState), [featureState.id]);

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
            {featureState.title && featureState.title || T`No title` /*
            formatCoordinates(toLonLat(
              mapProjection,
              isPointFeature(featureProps)
                ? featureProps.geometry.coordinate
                : (featureProps as LineStringFeature).geometry.coordinates[0]
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
        {isPoint(featureState.geometry)
          ? <Pin color={rgb[featureState.color]} />
          : <Line color={rgb[featureState.color]} />
        }
      </div >
      {isOpen && <div className="body" >
        aaaa
      </div >}
    </div >
  </div >;
};

export default FeatureView;
