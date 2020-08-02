import PluggableMap, {FrameState} from './PluggableMap';
import {BaseEvent} from './events/Event';

export default interface MapEvent extends BaseEvent {
  frame: FrameState
  map: PluggableMap
  target: object
  type: string
}
