import {Observable} from 'rxjs';

export interface Wording {
  readonly categoryVariants: string[];
  readonly routeVariants: string[];
  currentCategoryVariant: string | null;
  observableCurrentCategoryVariant: () => Observable<string | null>;
  currentRouteVariant: string | null;
  observableCurrentRouteVariant: () => Observable<string | null>;
  C: (key: string) => string;
  CR: (key: string) => string;
  R: (key: string) => string;
}