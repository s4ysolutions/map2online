import * as React from 'react';
import MenuItem from '../Menu/MenuItem';
import MenuSep from '../Menu/MenuSep';
import T from 'l10n';
import log from '../../../log';
import {getCatalog, getExporter, getImportUI} from '../../../di-default';

const importUI = getImportUI();
const exporter = getExporter();
const catalog = getCatalog();

const handleExportAll = () => {
  const category = catalog.categories.byPos(0)
  const routes = Array.from(category.routes)
  exporter.exportRoutesKML(routes, category)
};

const FileMenu: React.FunctionComponent<{}> = (): React.ReactElement => {
  log.render('FileMenu');
  const handleExportVisible = () => null;
  const handleExportLevel1 = () => null;
  const handleExportLevel2 = () => null;
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
    <MenuItem key="import" onClick={importUI.open} >
      <div className="title" >
        {T`Import`}
      </div >
    </MenuItem >
  </React.Fragment >;
};

export default FileMenu;
