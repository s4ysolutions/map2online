// @flow
import {Draw as DrawInteraction, Modify as ModifyInteraction, Snap as SnapInteraction,} from 'ol/interaction';
import {addFeature, updateFeatures} from '../../actions';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import {getCurrentLevel2} from '../../reducers/catalog/selectors';
import {getStyle} from './lib/styles';
import mongoid from 'mongoid-js';
import type {Reducer} from '../../reducers/flowtypes';

class _FeaturesInteractions extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      unmodifiedFeatures: _FeaturesInteractions.getUnmodifiedFeatures(props),
    };
  }

  static getUnmodifiedFeatures(props) {
    const {source} = props;
    return source.getFeatures().reduce((cache, f) => {
      const g = f.getGeometry();
      return {
        ...cache,
        [f.getId()]: {
          coordinates:
            g.getType() === 'Point'
              ? [
                g.getCoordinates()[0],
                g.getCoordinates()[1],
              ]
              : g.getCoordinates().map(c => [
                c[0],
                c[1],
              ]),
          id: f.getId(),
          type: g.getType(),
        },
      };
    }, {});
  }

  static getDerivedStateFromProps(props) {
    return {
      unmodifiedFeatures: _FeaturesInteractions.getUnmodifiedFeatures(props),
    };
  }

  getDrawInteraction() {
    const {active, newFeatureColor, newFeatureType} = this.props;
    return active
      ? new DrawInteraction({
        style: getStyle(newFeatureType, newFeatureColor),
        type: newFeatureType,
      })
      : null;
  }

  getModifyInteraction() {
    const {active, source} = this.props;
    return active ? new ModifyInteraction({source}) : null;
  }

  getSnapInteraction() {
    const {active, source} = this.props;
    return active ? new SnapInteraction({source}) : null;
  }

  handleDrawEnd(ev) {
    const {newFeatureColor, newFeatureParent, onAddFeature} = this.props;
    const newFeature = {
      id: mongoid(),
      color: newFeatureColor,
      geometry: {
        type: ev.feature.getGeometry().getType(),
        coordinates: ev.feature.getGeometry().getCoordinates(),
      },
    };
    onAddFeature(newFeatureParent, newFeature);
  }

  // eslint-disable-next-line max-lines-per-function
  handleModifyEnd(ev) {
    const {onUpdateFeatures} = this.props;
    const {unmodifiedFeatures} = this.state;
    const modifiedFeatures = ev.features.getArray().filter(olf => {
      const unmodified = unmodifiedFeatures[olf.getId()];
      if (!unmodified) {
        return false;
      }
      const g = olf.getGeometry();
      if (unmodified.type !== g.getType()) {
        return true;
      }
      const coordinates = g.getCoordinates();
      if (unmodified.type === 'Point') {
        if (
          coordinates[0] !== unmodified.coordinates[0] ||
          coordinates[1] !== unmodified.coordinates[1]
        ) {
          return true;
        }
      } else {
        if (coordinates.length !== unmodified.coordinates.length) {
          return true;
        }
        for (let i = 0; i < coordinates.length; i++) {
          if (
            coordinates[i][0] !== unmodified.coordinates[i][0] ||
            coordinates[i][1] !== unmodified.coordinates[i][1]
          ) {
            return true;
          }
        }
      }
      return false;
    });
    if (modifiedFeatures.length > 0) {
      onUpdateFeatures(modifiedFeatures.map(olf => ({
        id: olf.getId(),
        color: olf.get('color'),
        geometry: {
          type: olf.getGeometry().getType(),
          coordinates: olf.getGeometry().getCoordinates(),
        },
      })));
    }
  }

  render() {
    // eslint-disable-next-line no-console
    console.debug('OL FeaturesInteractions Render');
    const {active, map} = this.props;

    if (this.drawInteraction) {
      map.removeInteraction(this.drawInteraction);
    }
    if (this.modifyInteraction) {
      map.removeInteraction(this.modifyInteraction);
    }
    if (this.snapInteraction) {
      map.removeInteraction(this.snapInteraction);
    }

    if (active) {
      this.drawInteraction = this.getDrawInteraction();
      map.addInteraction(this.drawInteraction);
      this.drawInteraction.on('drawend', ev => {
        this.handleDrawEnd(ev);
      });

      this.modifyInteraction = this.getModifyInteraction();
      map.addInteraction(this.modifyInteraction);
      this.modifyInteraction.on('modifyend', ev => {
        this.handleModifyEnd(ev);
      });

      this.snapInteraction = this.getSnapInteraction();
      map.addInteraction(this.snapInteraction);
    }

    return false;
  }
}

_FeaturesInteractions.propTypes = {
  active: PropTypes.bool.isRequired,
  map: PropTypes.object.isRequired,
  newFeatureColor: PropTypes.string.isRequired,
  newFeatureParent: PropTypes.object.isRequired,
  newFeatureType: PropTypes.string.isRequired,
  onAddFeature: PropTypes.func.isRequired,
  onUpdateFeatures: PropTypes.func.isRequired,
  source: PropTypes.object.isRequired,
};

const FeaturesInteractions = connect(
  (state: Reducer) => ({
    active: state.ol.mouseInteraction,
    newFeatureColor: state.ui.featureSelectedPoint
      ? state.ui.featureSelectedPointColor
      : state.ui.featureSelectedLineColor,
    newFeatureParent: getCurrentLevel2(state.catalog),
    newFeatureType: state.ui.featureSelectedPoint ? 'Point' : 'LineString',
  }),
  dispatch => ({
    onAddFeature: (parent, feature) => {
      dispatch(addFeature(parent, feature));
    },
    onUpdateFeatures: modifiedFeatures => {
      dispatch(updateFeatures(modifiedFeatures));
    },
  })
)(_FeaturesInteractions);

FeaturesInteractions.propTypes = {
  map: PropTypes.object.isRequired,
  source: PropTypes.object.isRequired,
};

export default FeaturesInteractions;
