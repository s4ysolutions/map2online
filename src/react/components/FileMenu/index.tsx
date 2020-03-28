import * as React from 'react';
import MenuItem from '../Menu/MenuItem';
import MenuSep from '../Menu/MenuSep';
import T from 'l10n';
import log from '../../../log';
import {getImportUI} from '../../../di-default';

const importUI = getImportUI();

const FileMenu: React.FunctionComponent<{}> = (): React.ReactElement => {
  log.render('FileMenu');
  const handleExportAll = () => null;
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
    <MenuItem key="level1" onClick={handleExportLevel1} >
      <div className="title" >
        {T`Export Current Level1`}
      </div >
    </MenuItem >
    <MenuItem key="level2" onClick={handleExportLevel2} >
      <div className="title" >
        {T`Export Current Level2`}
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
