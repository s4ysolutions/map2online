import PluggableMap from './PluggableMap';

interface MapOptions {
  target: HTMLElement;
  view: View;
}

export default class Map extends PluggableMap {
  constructor(opts: MapOptions);

}
