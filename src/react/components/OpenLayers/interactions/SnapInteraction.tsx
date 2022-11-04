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
import {Snap as OlSnapInteraction} from 'ol/interaction';
import activeFeaturesContext from '../context/active-features-source';

const SnapInteraction: React.FunctionComponent<{ map: Map }> = ({map}): null => {
  const source = React.useContext(activeFeaturesContext);

  const snapInteractionRef = React.useRef<OlSnapInteraction | null>(null);

  useEffect(() => {
    if (snapInteractionRef.current) {
      map.removeInteraction(snapInteractionRef.current);
    }
    snapInteractionRef.current = new OlSnapInteraction({source});
    map.addInteraction(snapInteractionRef.current);
  }, [map, source]);

  return null;
};

export default SnapInteraction;
