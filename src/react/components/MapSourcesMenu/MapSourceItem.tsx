import * as React from 'react';
import MenuSubItem from '../Menu/MenuSubItem';
import {MapDefinition} from '../../../map-sources/definitions';
import log from '../../../log';
import {getBaseLayer} from '../../../di-default';
import useObservable from '../../hooks/useObservable';

const baseLayer = getBaseLayer();

interface Props {
  source: MapDefinition;
}

const MapSourceItem: React.FunctionComponent<Props> = ({source}): React.ReactElement => {
  const baseLayerName = useObservable(baseLayer.sourceNameObservable(), baseLayer.sourceName);
  log.render('MapSourceItem', {baseLayerName});
  return <MenuSubItem onClick={(ev): void => {
    log.debug('MapSourceItem clicked', source.id)
    if (baseLayer.sourceName !== source.id) {
      baseLayer.sourceName = source.id;
    }
    ev.stopPropagation();
  }} >
    {source.id}
  </MenuSubItem >;
};

export default MapSourceItem;
