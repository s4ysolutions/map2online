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

import React from 'react';
import Map from 'ol/Map';
import {Interaction} from 'ol/interaction';
import {MapBrowserEvent} from 'ol';
import {useEffect} from 'react';

class KeyboardEventInteractionClass extends Interaction {
  // eslint-disable-next-line class-methods-use-this
  handleEvent(mapBrowserEvent: MapBrowserEvent<KeyboardEvent>) {
    let stopEvent = false;
    if (mapBrowserEvent.type === 'keydown') {
      const keyEvent = mapBrowserEvent.originalEvent;
      if (keyEvent.code?.toLowerCase() === 'escape') {
        stopEvent = true;
      }
      if (stopEvent) {
        keyEvent.preventDefault();
      }
    }
    return !stopEvent;
  }
}
// TODO: not working, need refactoring
const KeyboardEventInteraction: React.FunctionComponent<{ map: Map }> = ({map}): null => {

  const interactionRef = React.useRef<KeyboardEventInteractionClass | null>(null);

  useEffect(() => {
    if (interactionRef.current) {
      map.removeInteraction(interactionRef.current);
    }
    interactionRef.current = new KeyboardEventInteractionClass();
    map.addInteraction(interactionRef.current);
  }, [map]);

  return null;
};

export default KeyboardEventInteraction;
