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

import {Interaction} from 'ol/interaction';
import MapBrowserEvent from 'ol/MapBrowserEvent';
import React, {useEffect, useRef, useState} from 'react';
import olMapContext from '../../context/map';
import './styles.scss';
import {useDrawing} from '../../hooks/useDrawing';

const MENU_OFFSET_Y = -8;

class OlContextMenuInteraction extends Interaction {
  private isDrawing = false;

  private openHandler: ((open: boolean) => void) | null = null;

  private isOpen = false;

  private el: HTMLDivElement;

  constructor(el: HTMLDivElement) {
    super();
    this.el = el;
  }

  private close(): void {
    if (this.openHandler) {
      this.openHandler(false);
    }
    this.isOpen = false;
  }

  private open(): void {
    if (this.openHandler) {
      this.openHandler(true);
    }
    this.isOpen = true;
  }

  handleEvent(mapBrowserEvent: MapBrowserEvent<KeyboardEvent>) {
    if (!this.isDrawing && mapBrowserEvent.type === 'contextmenu') {
      this.open();
      const menuRect = this.el.getBoundingClientRect();
      const mapRect = this.getMap()?.getViewport()
        ?.getBoundingClientRect();

      if (mapRect) {
        const [x, y] = mapBrowserEvent.pixel;
        // this.el.style.left = `${(x - mapRect.left).toString()}px`;
        // this.el.style.top = `${(y - mapRect.top).toString()}px`;
        this.el.style.left = `${(x).toString()}px`;
        this.el.style.top = `${(y + MENU_OFFSET_Y).toString()}px`;
      }

      const close = (event: MouseEvent): boolean => {
        if (menuRect) {
          // close menu on click outside it
          if (event.clientX < menuRect.left ||
              event.clientX > menuRect.right ||
            event.clientY < menuRect.top ||
            event.clientY > menuRect.bottom) {
            this.close();
            event.preventDefault();
            return false;
          }
        }
        return true;
      };
      document.addEventListener('mousedown', close, {once: true});

      mapBrowserEvent.preventDefault();
      return false;
    }
    if (this.isOpen && (mapBrowserEvent.type === 'pointerdown')) {
      this.close();
      mapBrowserEvent.preventDefault();
      return false;
    }
    return super.handleEvent(mapBrowserEvent);
  }

  setDrawing(isDrawing: boolean) {
    this.isDrawing = isDrawing;
  }

  setOpenHandler(openHandler: (open: boolean) => void) {
    this.openHandler = openHandler;
  }
}

const ContextMenuInteraction: React.FunctionComponent<{ hitTolerance: number, children: React.ReactNode | React.ReactNode[] }> =
  ({hitTolerance, children}): React.ReactElement => {
    console.log(hitTolerance);
    const map = React.useContext(olMapContext);

    const interactionRef = React.useRef<OlContextMenuInteraction | null>(null);
    const elRef = useRef<HTMLDivElement>(null as unknown as HTMLDivElement);

    useEffect(() => {
      if (interactionRef.current) {
        map.removeInteraction(interactionRef.current);
      }
      interactionRef.current = new OlContextMenuInteraction(elRef.current);
      map.addInteraction(interactionRef.current);
      return () => {
        if (interactionRef.current) {
          map.removeInteraction(interactionRef.current);
        }
      };
    }, [map]);

    const isDrawing = useDrawing();
    useEffect(() => {
      if (interactionRef.current) {
        interactionRef.current?.setDrawing(isDrawing);
      }
    }, [isDrawing]);

    const [open, setOpen] = useState(false);
    useEffect(() => {
      if (interactionRef.current) {
        interactionRef.current?.setOpenHandler(setOpen);
      }
    }, [setOpen]);

    return <div
      className={`map-context-menu menu ${open ? 'active' : 'inactive'}`}
      onClick={() => setOpen(false)}
      ref={elRef}
    >
      {children}
    </div >;
  };

export default ContextMenuInteraction;
