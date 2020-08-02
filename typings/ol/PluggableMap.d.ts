import BaseLayer from './layer/Base';
import View, {State} from './View';

export default interface PluggableMap {
  target: HTMLElement | string | undefined
  view: View

  addLayer(layer: BaseLayer);

  removeLayer(layer: BaseLayer | undefined);
}

export interface FrameState {
  viewState: State
}
