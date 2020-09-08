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

import {Observable} from 'rxjs';

export interface Wording {
  readonly isPersonalized: boolean;
  observableIsPersonalized: () => Observable<boolean>;
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
