// @flow
import type {CatalogState} from '../../reducers/catalog/flowtypes';
import type {Feature} from '../../flowtypes/catalog';
import FeaturesInteractions from './FeaturesInteractions';
import LineString from 'ol/geom/LineString';
import OlFeature from 'ol/Feature';
import Point from 'ol/geom/Point';
import PropTypes from 'prop-types';
import React from 'react';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import {connect} from 'react-redux';
import {createSelector} from 'reselect';
import {getStyle} from './lib/styles';
import {getVisibleFeatures} from '../../reducers/catalog/selectors';
import type {Reducer} from '../../reducers/flowtypes';

class _CurrentFeatures extends React.PureComponent {
  constructor(props) {
    super(props);
    this.source = new VectorSource({wrapX: false});
    this.layer = new VectorLayer({source: this.source});
  }

  render() {
    // eslint-disable-next-line no-console
    console.debug('OL CurrentFeatures Render');
    const {map, features} = this.props;

    if (
      map
        .getLayers()
        .getArray()
        .indexOf(this.layer) < 0
    ) {
      map.addLayer(this.layer);
    }

    this.source.clear();
    this.source.addFeatures(features);

    return <FeaturesInteractions map={map} source={this.source} />;
  }
}

_CurrentFeatures.propTypes = {
  features: PropTypes.array.isRequired,
  map: PropTypes.object.isRequired,
};

const getOlFeatures: (state: CatalogState) => Feature[] = createSelector(
  (state: CatalogState): Feature[] => getVisibleFeatures(state),
  (features: Feature[]) => features.map(feature => {
    const f = new OlFeature({
      color: feature.color,
      geometry:
        feature.geometry.type === 'Point'
          ? new Point(feature.geometry.coordinate)
          : new LineString(feature.geometry.coordinates),
      id: feature.id,
    });
    f.setId(feature.id);
    f.set('color', feature.color);
    f.setStyle(getStyle(feature.geometry.type, feature.color));
    return f;
  })
);

const CurrentFeatures = connect((state: Reducer) => ({
  features: getOlFeatures(state.catalog),
}))(_CurrentFeatures);

export default CurrentFeatures;
