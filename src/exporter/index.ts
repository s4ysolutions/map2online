import {Category, Route} from '../app-rx/catalog';

export interface Exporter {
  exportRoutesKML: (routes: Route[], category?: Category) => void
}