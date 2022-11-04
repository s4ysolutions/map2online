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

import * as React from 'react';
import MenuItem from '../../Menu/MenuItem';
import T from 'l10n';
import log from '../../../../log';
import {getCatalog, getCatalogUI, getExporter, getWording, getWorkspace} from '../../../../di-default';
import Check from '../../Svg/Check';
import './style.scss';
import useObservable from '../../../hooks/useObservable';
import Menu from '../../Menu/Menu';

const exporter = getExporter();
const catalog = getCatalog();
const workspace = getWorkspace();
const catalogUI = getCatalogUI();
const wording = getWording();

const toggleVisible = (): void => {
  exporter.onlyVisible = !exporter.onlyVisible;
};

const handleExportAll: () => void = () => {
  workspace.closeMenus();
  exporter.exportCategoriesKML(Array.from(catalog.categories));
};

const handleExportCategory: () => void = () => {
  workspace.closeMenus();
  const {activeCategory} = catalogUI;
  if (activeCategory) {
    exporter.exportRoutesKML(Array.from(activeCategory.routes), activeCategory);
  }
};

const handleExportRoute: () => void = () => {
  workspace.closeMenus();
  const {activeRoute} = catalogUI;
  if (activeRoute && catalogUI.activeCategory) {
    exporter.exportRoutesKML([activeRoute], catalogUI.activeCategory);
  }
};

const FileMenu: React.FunctionComponent = (): React.ReactElement => {
  log.render('FileMenu');
  const allVisible = useObservable(exporter.onlyVisibleObservable(), exporter.onlyVisible);

  const checkMark = <div className={`pre all-visible-menu ${allVisible ? 'on' : 'off'}`} >
    <Check />
  </div >;

  return <Menu >
    <MenuItem after={checkMark} key="visible" onClick={toggleVisible} title={T`Only visible`} />

    <MenuItem key="all" onClick={handleExportAll} title={T`Export all`} />

    <MenuItem key="export_category" onClick={handleExportCategory} title={wording.C('Export category')} />

    <MenuItem key="export_route" onClick={handleExportRoute} title={wording.R('Export route')} />
  </Menu >;
};

export default FileMenu;
