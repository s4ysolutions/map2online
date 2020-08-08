import * as React from 'react';
import T from 'l10n';
import log from '../../../log';
import MenuItem from '../Menu/MenuItem';
import {getWorkspace} from '../../../di-default';

const workspace = getWorkspace();

const SettingsMenu: React.FunctionComponent = (): React.ReactElement => {
  log.render('SettingsMenu');
  return <React.Fragment >
    <MenuItem onClick={workspace.toggleTools} >
      <div className="title" >
        {T`Tools`}
      </div >
    </MenuItem >
    <MenuItem onClick={workspace.togglePersonalization} >
      <div className="title" >
        {T`Personalization`}
      </div >
    </MenuItem >
  </React.Fragment >;
};

export default SettingsMenu;
