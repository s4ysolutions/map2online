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

import React, {useEffect} from 'react';
import Map from 'ol/Map';
import {Select as SelectInteraction} from 'ol/interaction';
import activeFeaturesContext from './context/active-features-source';
import {click} from 'ol/events/condition';
import {Fill, Stroke, Style} from 'ol/style';
import {StyleFunction} from 'ol/style/Style';
import {FeatureLike} from 'ol/Feature';

const selected = new Style({
  fill: new Fill({
    color: '#eeeeee',
  }),
  stroke: new Stroke({
    color: 'rgba(255, 255, 255, 0.7)',
    width: 2,
  }),
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
// noinspection JSUnusedLocalSymbols
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const selectStyle: StyleFunction = (feature: FeatureLike): Style => {
  const color = feature.get('COLOR') || '#eeeeee';
  selected.getFill().setColor(color);
  return selected;
};

const SelectInteractions: React.FunctionComponent<{ map: Map }> = ({map}): null => {
  const source = React.useContext(activeFeaturesContext);

  const selectInteractionRef = React.useRef<SelectInteraction | null>(null);

  useEffect(() => {
    if (selectInteractionRef.current) {
      map.removeInteraction(selectInteractionRef.current);
    }
    selectInteractionRef.current = new SelectInteraction({condition: click});
    map.addInteraction(selectInteractionRef.current);
  }, [map, source]);

  return null;
};

export default SelectInteractions;
