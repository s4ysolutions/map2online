import MapEvent from './MapEvent';
import {Coordinate} from 'ol/coordinate'
import {FrameState} from './PluggableMap';

export default interface MapBrowserEvent extends MapEvent {
  frameState: FrameState
  coordinate: Coordinate
}
