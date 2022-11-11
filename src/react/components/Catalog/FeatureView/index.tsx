/* eslint-disable @typescript-eslint/no-non-null-assertion */
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
import Delete from '../../Svg/Delete';
import Hidden from '../../Svg/Hidden';
import Visible from '../../Svg/Visible';
import {Feature, Geometry, ID, LineString, Route, isLineString, isPoint} from '../../../../catalog';
import {getCatalogUI, getMap2Styles} from '../../../../di-default';
import useObservable from '../../../hooks/useObservable';
import {filter, map} from 'rxjs/operators';
import Pin from '../../Svg/Pin';
import Line from '../../Svg/Line';
import {formatCoordinate, formatCoordinates} from '../../../../lib/format';
import {skipConfirmDialog} from '../../../../lib/confirmation';
import Edit from '../../Svg/Edit';
import T from '../../../../l10n';
import {Style} from '../../../../style';
import {Draggable, DraggingStyle, NotDraggingStyle} from 'react-beautiful-dnd';
import Coordinates from './Coordinates';
import './styles.scss';
import RichTextView from '../../RichTextView';
import {RichText} from '../../../../richtext';

const catalogUI = getCatalogUI();
const map2styles = getMap2Styles();

const getDraggingStyle = (isDragging: boolean, draggableStyle: DraggingStyle | NotDraggingStyle): DraggingStyle | NotDraggingStyle => ({
  /*
   * some basic styles to make the items look a bit nicer
   * userSelect: 'none',
   */

  /*
   *  padding: grid2,
   * margin: `0 0 ${grid}px 0`,
   */

  /*
   * change background colour if dragging
   * background: isDragging ? 'lightgreen' : 'grey',
   */

  // styles we need to apply on draggables
  ...draggableStyle,
});

const FeatueView: React.FunctionComponent<{isLast: boolean; feature: Feature; route: Route; index: number }> = ({
  isLast,
  index,
  feature: featureView,
  route,
}): React.ReactElement => {
  const feature = useObservable<{id: ID, title: string, geometry: Geometry, style: Style, description: RichText}>(
    featureView.observable()
      .pipe(
        filter(f => Boolean(f)),
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        map((f) =>
          ({id: f!.id, title: f!.title, geometry: f!.geometry, style: f!.style, description: f!.description})),
      ),
    featureView,
  );

  const hasDescription = !RichText.isEmpty(feature.description);
  const isVisible = useObservable(featureView.observable().pipe(map(f => f && f.visible)), featureView.visible);
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


  const handleVisible = React.useCallback(() => {
    featureView.visible = !featureView.visible;
  }, [featureView]);
  const handleEdit = React.useCallback(() => catalogUI.startEditFeature(featureView), [featureView]);

  return <div className={`accordion-item feature ${isLast && isOpen ? 'last' : ''}`} >

    <Draggable draggableId={feature.id} index={index} >
      {(provided, snapshot): React.ReactElement => <div
        className="draggable xfeatures"
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        style={getDraggingStyle(
          snapshot.isDragging,
          provided.draggableProps.style || {},
        )}
      >

        <div className="item" >
          <div
            className="delete"
            key="delete"
            onClick={handleDelete}
            title={isPoint(featureView.geometry) ? T`Delete feature point hint` : T`Delete feature line hint`}
          >
            <Delete />
          </div >

          <div
            className="complex-title"
            key="complex-title"
            onClick={handleOpen}
            title={isPoint(featureView.geometry) ? T`Open feature point hint` : T`Open feature line hint`}
          >
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

          <div
            className="edit"
            key="edit"
            onClick={handleEdit}
            title={isPoint(featureView.geometry) ? T`Modify feature point hint` : T`Modify feature line hint`}
          >
            <Edit />
          </div >

          <div
            className="visibility"
            key="visibility"
            onClick={handleVisible}
            title={isVisible
              ? (isPoint(featureView.geometry) ? T`Visibility off feature point hint` : T`Visibility off feature line hint`)
              : (isPoint(featureView.geometry) ? T`Visibility on feature point hint` : T`Visibility on feature line hint`)}
          >
            {isVisible ? <Visible /> : <Hidden />}
          </div >

          <div className="type" key="type" >
            {isPoint(feature.geometry)
              ? <Pin color={feature.style.iconStyle?.color || map2styles.defaultStyle.iconStyle.color} />
              : <Line color={feature.style.lineStyle?.color || map2styles.defaultStyle.lineStyle.color} />}
          </div >
        </div >
      </div >}
    </Draggable >

    {isOpen ? <div className="body">
      {isPoint(feature.geometry)
        ? <React.Fragment>
          <Coordinates geometry={feature.geometry} />

          {hasDescription ? <hr className="coordinates-separator" /> : null}
        </React.Fragment>
        : null }

      {hasDescription ? <RichTextView content={feature.description} /> : null}

      {isLineString(feature.geometry)
        ? <React.Fragment>
          {hasDescription ? <hr className="coordinates-separator" /> : null}

          <Coordinates geometry={feature.geometry} />
        </React.Fragment>
        : null }
    </div > : null}
  </div >;
};

export default FeatueView;
