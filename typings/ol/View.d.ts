import {Coordinate} from 'ol/coordinate'

interface ViewOptions {
  center: Coordinate;
  zoom: number;
}

export default class View {
  constructor(opts: ViewOptions);
}
