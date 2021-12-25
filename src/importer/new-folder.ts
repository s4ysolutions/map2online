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

import {ImportedFolder} from './index';
import {makeEmptyRichText} from '../richtext';

export const newImportedFolder = (level: number, parent: ImportedFolder | null): ImportedFolder => ({
  features: [],
  folders: [],
  name: '',
  description: makeEmptyRichText(),
  visible: true,
  open: false,
  level,
  parent,
});

