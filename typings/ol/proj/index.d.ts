import {Coordinate} from 'ol/coordinate';

declare module 'ol/proj' {
  export declare function fromLonLat(coordinate: Coordinate, opt_projections?: Projection): Coordinate

  export declare function toLonLat(coordinate: Coordinate, opt_projections?: Projection): Coordinate
}
