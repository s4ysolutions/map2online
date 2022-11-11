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

import React, {useCallback, useRef, useState} from 'react';
import {useEffect} from 'react';
import {useDrawing} from '../hooks/useDrawing';
import olMapContext from '../context/map';
import {LayerType} from '../lib/types';
import './styles.scss';
import {Pixel} from 'ol/pixel';
// TODO: obsolete - remove asap, use interaciton instead
const ContextMenu: React.FunctionComponent<{ hitTolerance: number, children: React.ReactNode | React.ReactNode[] }> =
  ({hitTolerance, children}): React.ReactElement | null => {
    const map = React.useContext(olMapContext);

    const isNotDrawing = !useDrawing();

    const [open, setOpen] = useState(false);
    const menuClickPixel = useRef<Pixel>([0, 0]);

    /* (element: HTMLDivElement): void => {
      if (element) {
        element.style.visibility = 'visible';
        console.log(menuClickPixel.current);

      }
    };*/

    // useRef to avoid unnecessary redrawing
    const handleContextMenu = React.useCallback((event: MouseEvent) => {
      event.preventDefault();
      if (open) {
        setOpen(false);
      } else {
        const pixel = map.getEventPixel(event);
        menuClickPixel.current = pixel;
        const features = map.getFeaturesAtPixel(pixel, {
          layerFilter: function layerFilter(layer): boolean {
            const map2Id = layer.get('map2Id');
            return map2Id === LayerType.ACTIVE_FEATURES;
          },
          hitTolerance,
        });

        setOpen(true);
      }
    }, [hitTolerance, map]);

    useEffect(() => {
      if (isNotDrawing && !open) {
        map.getViewport().addEventListener('contextmenu', handleContextMenu, true);
      } else {
        map.getViewport().removeEventListener('contextmenu', handleContextMenu, true);
      }
      return () => {
        map.getViewport().removeEventListener('contextmenu', handleContextMenu, true);
      };
    }, [handleContextMenu, isNotDrawing, map, open]);

    const handleClickOutside = useCallback((event: MouseEvent):boolean => {
      const menu = document.getElementById('map-context-menu');
      if (menu && !menu.contains(event.target as Node)) {
        console.log('click outside');
        // setOpen(false);
        event.preventDefault();
        return false;
      }
      return true;
    }, [setOpen]);

    useEffect(() => {
      if (open) {
        console.log('bind');
        document.addEventListener('mousedown', handleClickOutside, true);
        document.addEventListener('mouseup', handleClickOutside, true);
      }
      return () => {
        document.removeEventListener('mousedown', handleClickOutside, true);
        document.removeEventListener('mouseup', handleClickOutside, true);
        console.log('unbind');
      };
    }, [open]);

    return open ? <div className="map-context-menu menu" id="map-context-menu" onClick={() => setOpen(false)} >
      {children}
    </div > : null;
  };

export default ContextMenu;
