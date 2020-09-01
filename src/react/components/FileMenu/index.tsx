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
import MenuItem from '../Menu/MenuItem';
import MenuSep from '../Menu/MenuSep';
import T from 'l10n';
import log from '../../../log';
import {getCatalog, getExporter, getImportUI, getWorkspace} from '../../../di-default';

const importUI = getImportUI();
const exporter = getExporter();
const catalog = getCatalog();
const workspace = getWorkspace();

const handleExportAll = () => {
  workspace.closeMenus();
  const category = catalog.categories.byPos(0);
  const routes = Array.from(category.routes);
  exporter.exportRoutesKML(routes, category);
};

const FileMenu: React.FunctionComponent = (): React.ReactElement => {
  log.render('FileMenu');
  const handleExportVisible: () => void = () => null;
  const handleExportLevel1: () => void = () => null;
  const handleExportLevel2: () => void = () => null;
  return <React.Fragment >
    <MenuItem key="all" onClick={handleExportAll} >
      <div className="title" >
        {T`Export All`}
      </div >
    </MenuItem >
    <MenuItem key="visible" onClick={handleExportVisible} >
      <div className="title" >
        {T`Export Visible`}
      </div >
    </MenuItem >
    <MenuItem key="export_all" onClick={handleExportLevel1} >
      <div className="title" >
        {T`Export All`}
      </div >
    </MenuItem >
    <MenuItem key="export_category" onClick={handleExportLevel2} >
      <div className="title" >
        {T`Export category`}
      </div >
    </MenuItem >
    <MenuItem key="export_route" onClick={handleExportLevel2} >
      <div className="title" >
        {T`Export route`}
      </div >
    </MenuItem >
    <MenuSep key="sep1" />
    <MenuItem
      key="import"
      onClick={() => {
        workspace.closeMenus();
        importUI.open();
      }} >
      <div className="title" >
        {T`Import`}
      </div >
    </MenuItem >
  </React.Fragment >;
};

export default FileMenu;
