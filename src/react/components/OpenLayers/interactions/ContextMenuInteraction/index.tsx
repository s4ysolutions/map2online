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
import {LayerType} from '../../lib/types';
import {Feature, Route, isPoint} from '../../../../../catalog';
import {getCatalog, getCatalogUI, getWording, getWorkspace} from '../../../../../di-default';
import Menu from '../../../UIElements/Menu/Menu';
import MenuItem from '../../../UIElements/Menu/MenuItem';
import T from '../../../../../l10n';
import {skipConfirmDialog} from '../../../../../lib/confirmation';

const MENU_OFFSET_Y = -8;
const MENU_MARGIN = 2;

const catalog = getCatalog();
const catalogUi = getCatalogUI();
const workspace = getWorkspace();
const wording = getWording();

const deletePointOrLineString = (feature: Feature) => {
  let route: Route | null = null;
  if (catalogUi.activeRoute && catalogUi.activeRoute.features.hasFeature(feature)) {
    route = catalogUi.activeRoute;
  }
  if (!route) {
    const routes = feature.routes;
    if (routes.length > 0) {
      route = routes[0];
    }
  }
  if (route) {
    if (skipConfirmDialog()) {
      route.features.remove(feature).then();
    } else {
      catalogUi.requestDeleteFeature(feature, route);
    }
  }
};

const showFeature = (feature: Feature) => {
  catalogUi.showFeature(feature);
  if (!workspace.catalogOpen) {
    workspace.toggleCatalog();
  }
};

class OlContextMenuInteraction extends Interaction {
  private isDrawing = false;

  private openHandler: ((open: boolean) => void) | null = null;

  private isOpen = false;

  private el: HTMLDivElement;

  private readonly hitTolerance: number;

  private _contextFeature: Feature | null = null;

  constructor(el: HTMLDivElement, hitTolerance: number) {
    super();
    this.el = el;
    this.hitTolerance = hitTolerance;
  }

  get contextFeature(): Feature | null {
    return this._contextFeature;
  }

  private close(): void {
    this._contextFeature = null;
    if (this.openHandler) {
      this.openHandler(false);
    }
    this.isOpen = false;
  }

  private open(event: MapBrowserEvent<MouseEvent>): void {
    this._contextFeature = null;
    const map = this.getMap();
    if (map) {
      const pixel = map.getEventPixel(event.originalEvent);
      const olFeatures = map.getFeaturesAtPixel(pixel, {
        layerFilter: function layerFilter(layer): boolean {
          const map2Id = layer.get('map2Id');
          return map2Id === LayerType.ACTIVE_FEATURES;
        },
        hitTolerance: this.hitTolerance,
      });
      const ids: string[] = olFeatures
        .map(olFeature => olFeature.getId())
        .filter(id => Boolean(id)) as string[];

      const features: Feature[] = ids
        .map((id: string) => catalog.featureById(id))
        .filter(feature => Boolean(feature)) as Feature[];

      if (features.length > 0) {
        this._contextFeature = features[0];
      }
    }
    if (this.openHandler) {
      this.openHandler(true);
    }
    this.isOpen = true;
  }

  handleEvent(mapBrowserEvent: MapBrowserEvent<MouseEvent>) {
    if (!this.isDrawing && mapBrowserEvent.type === 'contextmenu') {
      this.open(mapBrowserEvent);

      const close = (event: MouseEvent): boolean => {
        const menuRect = this.el.getBoundingClientRect();
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

      const mapRect = this.getMap()?.getViewport()
        ?.getBoundingClientRect();

      if (mapRect) {
        const [x, y] = mapBrowserEvent.pixel;
        this.el.style.left = `${(x).toString()}px`;
        this.el.style.top = `${(y + MENU_OFFSET_Y).toString()}px`;
      }

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

const ContextMenuInteraction: React.FunctionComponent<{ hitTolerance: number, children?: React.ReactNode | React.ReactNode[] }> =
  ({hitTolerance, children}): React.ReactElement => {
    const map = React.useContext(olMapContext);

    const interactionRef = React.useRef<OlContextMenuInteraction | null>(null);
    const elRef = useRef<HTMLDivElement>(null as unknown as HTMLDivElement);

    useEffect(() => {
      if (interactionRef.current) {
        map.removeInteraction(interactionRef.current);
      }
      interactionRef.current = new OlContextMenuInteraction(elRef.current, hitTolerance);
      map.addInteraction(interactionRef.current);
      return () => {
        if (interactionRef.current) {
          map.removeInteraction(interactionRef.current);
        }
      };
    }, [hitTolerance, map]);

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

    useEffect(() => {
      if (open) {
        const menuRect = elRef.current.getBoundingClientRect();
        const mapRect = interactionRef.current?.getMap()?.getViewport()
          ?.getBoundingClientRect();

        if (mapRect) {
          if (menuRect.right > mapRect.right) {
            const left = mapRect.width - menuRect.width - MENU_MARGIN;
            elRef.current.style.left = `${(left < 0 ? 0 : left).toString()}px`;
          }
          if (menuRect.top < mapRect.top) {
            elRef.current.style.top = `${(MENU_MARGIN).toString()}px`;
          }
        }
      }
    }, [open]);

    const contextFeature = open ? interactionRef.current?.contextFeature : null;

    return <div
      className={`map-context-menu menu ${contextFeature ? 'active' : 'inactive'}`}
      onClick={() => setOpen(false)}
      ref={elRef}
    >
      {contextFeature ? <Menu >
        <MenuItem
          onClick={() => deletePointOrLineString(contextFeature)}
          title={isPoint(contextFeature.geometry) ? T`Delete point` : T`Delete line`} />

        <MenuItem
          onClick={() => showFeature(contextFeature)}
          title={wording.R('Find in catalog')} />
      </Menu > : null}

      {children}
    </div >;
  };

export default ContextMenuInteraction;
