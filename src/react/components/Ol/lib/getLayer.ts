/*
 * Copyright 2022 s4y.solutions
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {Source} from 'ol/source';
import TileLayer from 'ol/layer/Tile';
import TileSource from 'ol/source/Tile';
import {Layer} from 'ol/layer';

const isTileSource = (source: Source): source is TileSource => (source as TileSource).getTile !== undefined;

const getLayer = (source: Source): Layer => {
  if (isTileSource(source)) {
    return new TileLayer({source});
  }
  throw Error('Only tile sources supported');
};

export default getLayer;
