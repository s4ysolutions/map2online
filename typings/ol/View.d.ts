import {Coordinate} from 'ol/coordinate'

export interface ViewOptions {
  center: Coordinate;
  zoom: number;
}

export interface State {
  center: Coordinate;
  zoom: number;
}

export default class View {
  constructor(opts: ViewOptions);
}
