/*
 * Copyright 2019 s4y.solutions
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* eslint-disable no-unused-vars */

import {Observable} from 'rxjs';
import {Style} from '../style';
import {RichText} from '../richtext';

export type ID = string;

export interface Coordinate {
  alt: number;
  lat: number;
  lon: number;
}

export const isCoordinate = (coordinate: Coordinate | Coordinate[] | number | number[]): coordinate is Coordinate =>
  // eslint-disable-next-line no-extra-parens
  coordinate && ((coordinate as Coordinate).lon !== undefined && (coordinate as Coordinate).lat !== undefined);


export const coordinateEq = (c1: Coordinate, c2: Coordinate): boolean => c1.lat === c2.lat && c1.lon === c2.lon;
/*
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
*/
export interface Point {
  coordinate: Coordinate;
}

export interface LineString {
  coordinates: Coordinate[];
}

export interface FeatureProps {
  description: RichText;
  id: ID;
  summary: string;
  title: string;
  visible: boolean;
  style: Style;
  geometry: Point | LineString;
}

// used for persisting
export interface FeaturePropsWithStyleId extends FeatureProps {
  styleId: ID
}

// eslint-disable-next-line no-extra-parens
export const isPoint = (geometry: Point | LineString): geometry is Point => geometry && (geometry as Point).coordinate !== undefined;
// eslint-disable-next-line no-extra-parens
export const isLineString = (geometry: Point | LineString): geometry is LineString => geometry && (geometry as LineString).coordinates !== undefined;

export interface Feature extends FeatureProps {
  observable: () => Observable<Feature>;
  updateCoordinates: (coord: Coordinate | Coordinate[]) => void;
  eq: (anotherFeature: Feature) => boolean;
}

export interface Features extends Iterable<Feature> {
  readonly ts: ID;
  add: (props: FeatureProps | null, position?: number) => Promise<Feature>;
  hasFeature: (feature: Feature) => boolean;
  readonly length: number;
  remove: (feauture: Feature) => Promise<number>;
  observable: () => Observable<Features>;
  byPos: (index: number) => Feature | null;
  reorder: (from: number, to: number) => Promise<void>;
  delete: () => Promise<void>;
}

export interface RouteProps {
  description: RichText;
  id: ID;
  summary: string;
  title: string;
  visible: boolean;
  open: boolean;
}

export interface Route extends RouteProps {
  ts: ID;
  features: Features;
  observable: () => Observable<Route>;
}

export interface Routes extends Iterable<Route> {
  add: (props: RouteProps | null, position?: number) => Promise<Route>;
  has: (route: Route) => boolean;
  readonly length: number;
  remove: (route: Route) => Promise<number>;
  observable: () => Observable<Routes>;
  byPos: (index: number) => Route | null;
  reorder: (from: number, to: number) => Promise<void>;
  delete: () => Promise<void>;
}

export interface CategoryProps {
  id: ID;
  description: RichText;
  summary: string;
  title: string;
  visible: boolean;
  open: boolean;
}

export interface Category extends CategoryProps {
  routes: Routes;
  observable: () => Observable<Category>;
}

export interface Categories extends Iterable<Category> {
  add: (props: CategoryProps | null, position?: number) => Promise<Category>;
  has: (category: Category) => boolean;
  readonly length: number;
  remove: (category: Category) => Promise<number>;
  observable: () => Observable<Categories>;
  byPos: (index: number) => Category | null;
  reorder: (from: number, to: number) => void;
}

export interface Catalog {
  categories: Categories;
  routeById: (id: ID) => Route | null;
  categoryById: (id: ID) => Category | null;
  featureById: (id: ID) => Feature | null;
  readonly visibleFeatures: Feature[];
  visibleFeaturesObservable: (debounce?:boolean) => Observable<Feature[]>;
  // return previous state
  disableAutoCreateCategoryAndRoute: () => boolean;
  enableAutoCreateCategoryAndRoute: () => boolean;
  setAutoCreateCategoryAndRoute: (enabled: boolean) => void;
}
