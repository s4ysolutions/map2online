import BaseLayer from './layer/Base';

interface MapOptions {
  target: HTMLElement;
  view: View;
}

export default class Map {
  constructor(opts: MapOptions);

  addLayer(layer: BaseLayer);

  removeLayer(layer: BaseLayer | undefined);
}
