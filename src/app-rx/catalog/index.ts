import {Observable} from 'rxjs';
import {Color} from '../../lib/colors';

export type ID = string;

export interface Coordinate {
  alt: number;
  lat: number;
  lon: number;
}

export interface Point {
  coordinate: Coordinate;
}

export interface LineString {
  coordinates: Coordinate[];
}

export interface FeatureProps {
  description: string;
  id: ID;
  summary: string;
  title: string;
  visible: boolean;
  color: Color;
  geometry: Point | LineString;
}

export const isPoint = (geometry: Point | LineString): geometry is Point => geometry && (geometry as Point).coordinate !== undefined;
export const isLineString = (geometry: Point | LineString): geometry is LineString => geometry && (geometry as LineString).coordinates !== undefined;
export const isCoordinate = (coord: Coordinate | Coordinate[]): coord is Coordinate => (coord as Coordinate).alt !== undefined;

export interface Feature extends FeatureProps {
  delete: () => void;
  observable: () => Observable<Feature>;
  update: () => void;

  updateCoordinates(coord: Coordinate | Coordinate[]);
}

export interface Features extends Iterable<Feature> {
  add: (props: FeatureProps, position?: number) => Promise<Feature>;
  readonly length: number;
  remove: (feauture: Feature) => number;
  observable: () => Observable<Features>;
  byPos: (index: number) => Feature | null;
  reorder: (from: number, to: number) => void;
}

export interface RouteProps {
  description: string;
  id: ID;
  summary: string;
  title: string;
  visible: boolean;
}

export interface Route extends RouteProps {
  delete: () => void;
  features: Features;
  observable: () => Observable<Route>;
}

export interface Routes extends Iterable<Route> {
  add: (props: RouteProps, position?: number) => Promise<Route>;
  hasRoute: (route: Route) => boolean;
  readonly length: number;
  remove: (category: Route) => number;
  observable: () => Observable<Routes>;
  byPos: (index: number) => Route | null;
  reorder: (from: number, to: number) => void;
}

export interface CategoryProps {
  id: ID;
  description: string;
  summary: string;
  title: string;
  visible: boolean;
}

export interface Category extends CategoryProps {
  routes: Routes;
  observable: () => Observable<Category>;
  delete: () => void;
  hasRoute: (route: Route) => boolean;
}

export interface Categories extends Iterable<Category> {
  add: (props: CategoryProps | null, position?: number) => Promise<Category>;
  readonly length: number;
  remove: (category: Category) => number;
  observable: () => Observable<Categories>;
  byPos: (index: number) => Category | null;
  reorder: (from: number, to: number) => void;
}

export interface Catalog {
  categories: Categories;
  routeById: (id: ID) => Route | null;
  categoryById: (id: ID) => Category | null;
  featureById: (id: ID) => Feature | null;
  featuresObservable: () => Observable<Features>;
}
