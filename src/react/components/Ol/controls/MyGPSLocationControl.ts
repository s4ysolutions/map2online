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

/* eslint-disable */
import {Control} from 'ol/control';
import {Options} from 'ol/control/Control';
import {geoLocationPosition2ol} from '../lib/coordinates';

const MyGPSLocationInnerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
<path fill="currentColor" d="M256 0c17.7 0 32 14.3 32 32V66.7C368.4 80.1 431.9 143.6 445.3 224H480c17.7 0 32 14.3 32 32s-14.3 32-32 32H445.3C431.9 368.4 368.4 431.9 288 445.3V480c0 17.7-14.3 32-32 32s-32-14.3-32-32V445.3C143.6 431.9 80.1 368.4 66.7 288H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H66.7C80.1 143.6 143.6 80.1 224 66.7V32c0-17.7 14.3-32 32-32zM128 256c0 70.7 57.3 128 128 128s128-57.3 128-128s-57.3-128-128-128s-128 57.3-128 128zm128 80c-44.2 0-80-35.8-80-80s35.8-80 80-80s80 35.8 80 80s-35.8 80-80 80z"/>
</svg>`;


class MyGPSLocationControl extends Control {
  constructor(opt_options?: Options) {
    const options = opt_options || {};

    const button = document.createElement('button');
    button.innerHTML = MyGPSLocationInnerHTML;

    const element = document.createElement('div');
    element.className = 'ol-my-gps-location ol-unselectable ol-control';
    element.appendChild(button);

    super({...options, element});

    button.addEventListener('click', this.handleClick.bind(this), false);
  }

  handleClick() {
    const map = this.getMap();
    if (map !== null ) {
      navigator.geolocation.getCurrentPosition((position)=>{
        map.getView().setCenter(geoLocationPosition2ol(position.coords));
      });
    }
  };

}

export default MyGPSLocationControl;
