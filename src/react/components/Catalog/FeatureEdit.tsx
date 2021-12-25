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
import {FormEvent, useState} from 'react';
import Modal from '../Modal';
import {getCatalogUI} from '../../../di-default';
import {Coordinate, Feature, LineString, Point, isPoint} from '../../../catalog';
import useObservable from '../../hooks/useObservable';
import T from '../../../l10n';
import {formatCoordinate, formatCoordinates} from '../../../lib/format';
import log from '../../../log';
import {map} from 'rxjs/operators';
import {degreesToMeters} from '../../../lib/projection';
import ColorSelect from '../ColorSelect';
import RichTextEditor from '../RichTextEditor';

const catalogUI = getCatalogUI();
// eslint-disable-next-line no-unused-vars
const handleSubmit: (ev: FormEvent) => void = (ev: FormEvent) => {
  ev.preventDefault();
  catalogUI.commitEditFeature().then(r => r);
  return null;
};

const handleClose = () => catalogUI.cancelEditFeature();

const COORDINATE_LENGTH = 3;

const makeCoordinate = (line: string): Coordinate => {
  const parts = line.split(',').map(s => parseFloat(s))
    .filter(f => !isNaN(f));

  const parts0 =
    parts.length > COORDINATE_LENGTH
      ? parts.slice(0, COORDINATE_LENGTH)
      : parts.length > COORDINATE_LENGTH - 1
        ? parts
        : parts.length > 1
          ? [parts[0], parts[1], 0]
          : parts.length > 0
            ? [parts[0], 0, 0]
            : [0, 0, 0];

  // eslint-disable-next-line prefer-destructuring
  const swap = parts0[0];
  // eslint-disable-next-line prefer-destructuring
  parts0[0] = parts0[1];
  parts0[1] = swap;

  return degreesToMeters(parts0);
};

const makeGeometry = (text: string): Point | LineString => {
  const lines = text.match(/[^\r\n]+/gu).map(s => s.trim())
    .filter(s => s);
  if (lines.length === 0) {
    return {coordinate: {lon: 0, lat: 0, alt: 0}};
  } else if (lines.length === 1) {
    return {coordinate: makeCoordinate(lines[0])};
  }
  return {coordinates: lines.map(s => makeCoordinate(s))};

};

const MIN_COORDINATES_ROWS = 5;
const MAX_COORDINATES_ROWS = 10;

const FeatureEdit: React.FunctionComponent<{ feature: Feature }> = ({feature: featureEdit}): React.ReactElement => {

  const feature = useObservable(
    featureEdit.observable()
      .pipe(map(f => ({
        title: f.title,
        description: f.description,
        /*
         * pointCoordinates: isPoint(feature.geometry) ? formatCoordinate(feature.geometry.coordinate) : null,
         * lineCoordinates: isLineString(feature.geometry) ? formatCoordinates(feature.geometry.coordinates).split(' ') : null,
         */
      })))
    , featureEdit, /* {
      title: featureEdit.title,
      description: featureEdit.description,
      pointCoordinates: isPoint(featureEdit.geometry) ? formatCoordinate(featureEdit.geometry.coordinate) : null,
      lineCoordinates: isLineString(featureEdit.geometry) ? formatCoordinates(featureEdit.geometry.coordinates).split(' ') : null,
    }*/);

  const [coordinates, setCoordinates] = useState((isPoint(featureEdit.geometry)
    ? [formatCoordinate(featureEdit.geometry.coordinate)]
    : formatCoordinates(featureEdit.geometry.coordinates).split(' ')).join('\n'));
  const titleRef = React.useRef<HTMLInputElement>(null);

  log.render('FeatureEdit');

  React.useEffect((): void => {
    titleRef.current.focus();
    titleRef.current.select();
  }, []);

  return <Modal className="edit-dialog" closeOnEnter onClose={handleClose} >
    <form onSubmit={handleSubmit} >
      <h2 >
        {isPoint(featureEdit.geometry) ? T`Modify point` : T`Modify line`}
      </h2 >

      <div className="field-row" >
        <label htmlFor="title" >
          {T`Title`}
        </label >

        <input
          name="title"
          onChange={(ev): void => {
            featureEdit.title = ev.target.value;
          }}
          ref={titleRef}
          value={featureEdit.title} />
      </div >

      <div className="field-row" >
        <label htmlFor="description" >
          {T`Description`}
        </label >

        <RichTextEditor
          content={feature.description}
          onChange={content => {
            featureEdit.description = content;
          }} />
      </div >

      <div className="field-row" >
        <label htmlFor="coordinates" >
          {T`LatLon`}
        </label >

        {isPoint(featureEdit.geometry)
          ? <input
              name="coordinates"
              onChange={(ev): void => {
              setCoordinates(ev.target.value);
              featureEdit.geometry = makeGeometry(ev.target.value);
            }}
              value={coordinates} />
          : <textarea
              name="coordinates"
              onChange={(ev): void => {
              setCoordinates(ev.target.value);
              featureEdit.geometry = makeGeometry(ev.target.value);
            }}
              rows={Math.max(Math.min(MIN_COORDINATES_ROWS, coordinates.length), MAX_COORDINATES_ROWS)}
              value={coordinates} />}
      </div >

      <div className="buttons-row" >
        <ColorSelect
          isPoint={isPoint(featureEdit.geometry)}
          onColorSelect={(style) => {
            log.d(style);
            featureEdit.style = style;
          }}
          selected={featureEdit.style} />
      </div>

      <div className="buttons-row" >
        <button onClick={handleClose} type="button" >
          {T`Close`}
        </button >
      </div >
    </form >
  </Modal >;
};

export default FeatureEdit;
