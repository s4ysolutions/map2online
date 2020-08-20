import {Observable} from 'rxjs';
import {Color} from '../../lib/colors';

export type ID = string;

export interface Coordinate {
  alt: number;
  lat: number;
  lon: number;
}

export const isCoordinate = (coordinate: Coordinate | number | number[]): coordinate is Coordinate =>
  // eslint-disable-next-line no-extra-parens
  coordinate && ((coordinate as Coordinate).lon !== undefined && (coordinate as Coordinate).lat !== undefined);


export const coordinateEq = (c1: Coordinate, c2: Coordinate): boolean => c1.lat === c2.lat && c1.lon === c2.lon;
export const coordinatesEq = (c1: Coordinate[], c2: Coordinate[]): boolean => {
  if (c1.length !== c2.length) {
    return false;
  }
  for (const i in c1) {
    if (c1[i].lat !== c2[i].lat || c1[i].lon === c2[i].lon) {
      return false;
    }
  }
  return true;
};

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

// eslint-disable-next-line no-extra-parens
export const isPoint = (geometry: Point | LineString): geometry is Point => geometry && (geometry as Point).coordinate !== undefined;
// eslint-disable-next-line no-extra-parens
export const isLineString = (geometry: Point | LineString): geometry is LineString => geometry && (geometry as LineString).coordinates !== undefined;

export interface Feature extends FeatureProps {
  delete: () => void;
  observable: () => Observable<Feature>;

  updateCoordinates: (coord: Coordinate | Coordinate[]) => void;
}

export interface Features extends Iterable<Feature> {
  add: (props: FeatureProps, position?: number) => Promise<Feature>;
  readonly length: number;
  remove: (feauture: Feature) => number;
  observable: () => Observable<Features>;
  byPos: (index: number) => Feature | null;
  reorder: (from: number, to: number) => void;
  delete: () => void;
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
  remove: (route: Route) => number;
  observable: () => Observable<Routes>;
  byPos: (index: number) => Route | null;
  reorder: (from: number, to: number) => void;
  delete: () => void;
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
