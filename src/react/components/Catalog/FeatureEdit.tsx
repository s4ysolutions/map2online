import * as React from 'react';
import {FormEvent, useState} from 'react';
import Modal from '../Modal';
import {getCatalogUI} from '../../../di-default';
import {Coordinate, Feature, isPoint, LineString, Point} from '../../../app-rx/catalog';
import useObservable from '../../hooks/useObservable';
import T from '../../../l10n';
import {formatCoordinate, formatCoordinates} from '../../../lib/format';
import log from '../../../log';
import {map} from 'rxjs/operators';
import {degreesToMeters} from '../../../lib/projection';

const catalogUI = getCatalogUI();
const handleSubmit: (ev: FormEvent) => void = (ev: FormEvent) => {
  ev.preventDefault();
  catalogUI.commitEditFeature();
  return null;
};

const handleClose = () => catalogUI.cancelEditFeature();

const makeCoordinate = (line: string): Coordinate => {
  const parts = line.split(',').map(s => parseFloat(s)).filter(f => !isNaN(f))

  const parts0 =
    parts.length > 3
      ? parts.slice(0, 3)
      : parts.length > 2
      ? parts
      : parts.length > 1
        ? [parts[0], parts[1], 0]
        : parts.length > 0
          ? [parts[0], 0, 0]
          : [0, 0, 0];

  const swap = parts0[0]
  parts0[0] = parts0[1]
  parts0[1] = swap

  const ret = degreesToMeters(parts0)
  return ret;
}

const makeGeometry = (text: string): Point | LineString => {
  const lines = text.match(/[^\r\n]+/g).map(s => s.trim()).filter(s => s);
  if (lines.length === 0) {
    return {coordinate: {lon: 0, lat: 0, alt: 0}}
  } else if (lines.length === 1) {
    return {coordinate: makeCoordinate(lines[0])}
  } else {
    return {coordinates: lines.map(s => makeCoordinate(s))}
  }
}

const FeatureEdit: React.FunctionComponent<{ feature: Feature }> = ({feature: featureEdit}): React.ReactElement => {

  const feature = useObservable(featureEdit.observable()
    .pipe(
      map(feature => ({
        title: feature.title,
        description: feature.description,
        // pointCoordinates: isPoint(feature.geometry) ? formatCoordinate(feature.geometry.coordinate) : null,
        // lineCoordinates: isLineString(feature.geometry) ? formatCoordinates(feature.geometry.coordinates).split(' ') : null,
      }))
    )
    , featureEdit /*{
      title: featureEdit.title,
      description: featureEdit.description,
      pointCoordinates: isPoint(featureEdit.geometry) ? formatCoordinate(featureEdit.geometry.coordinate) : null,
      lineCoordinates: isLineString(featureEdit.geometry) ? formatCoordinates(featureEdit.geometry.coordinates).split(' ') : null,
    }*/);

  const [coordinates, setCoordinates] = useState(
    (isPoint(featureEdit.geometry)
      ? [formatCoordinate(featureEdit.geometry.coordinate)]
      : formatCoordinates(featureEdit.geometry.coordinates).split(' ')).join('\n'));
  const titleRef = React.useRef<HTMLInputElement>(null);

  log.render('FeatureEdit')

  React.useEffect((): void => {
    titleRef.current.focus();
    titleRef.current.select();
  }, []);

  return <Modal onClose={handleClose} closeOnEnter={true} className="edit-dialog" >
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
            featureEdit.title = ev.target.value
          }}
          ref={titleRef}
          value={featureEdit.title} />
      </div >
      <div className="field-row" >
        <label htmlFor="description" >
          {T`Description`}
        </label >
        <textarea rows={5}
                  name="description"
                  onChange={(ev): void => {
                    featureEdit.description = ev.target.value
                  }}
                  value={feature.description} />
      </div >
      <div className="field-row" >
        <label htmlFor="coordinates" >
          {T`LatLon`}
        </label >
        <textarea rows={Math.max(Math.min(5, coordinates.length), 10)}
                  name="coordinates"
                  onChange={(ev): void => {
                    setCoordinates(ev.target.value)
                    featureEdit.geometry = makeGeometry(ev.target.value)
                  }}
                  value={coordinates} />
      </div >
      <div className="buttons-row" >
        <button onClick={handleClose} >
          {T`Close`}
        </button >
      </div >
    </form >
  </Modal >;
};

export default FeatureEdit;
