import FileMenu from '../../FileMenu';
import MapSourcesMenu from '../../MapSourcesMenu';
import React from 'react';
import posed from 'react-pose';
import {tween} from 'popmotion';
import log from '../../../../log';
import {getWorkspace} from '../../../../di-default';
import useObservable from '../../../hooks/useObservable';
import SettingsMenu from '../../SettingsMenu';

const PosedMenu = posed.div({
  hide: {
    transition: tween,
    width: 0,
  },
  show: {
    transition: tween,
    width: 'auto',
  },
});

const workspace = getWorkspace();

const RightDrawer: React.FunctionComponent = (): React.ReactElement => {
  const stateFile = useObservable(workspace.fileObservable(), workspace.fileOpen);
  const stateSources = useObservable(workspace.sourcesObservable(), workspace.sourcesOpen);
  const stateSettings = useObservable(workspace.settingsObservable(), workspace.settingsOpen);
  log.render(`RightDrawer fileMenu=${stateFile} sourceMenu=${stateSources} settings=${stateSettings}`);
  return <PosedMenu className="right-drawer" pose={stateFile || stateSources || stateSettings ? 'show' : 'hide'} >
    {stateSources && <MapSourcesMenu />}
    {stateFile && <FileMenu />}
    {stateSettings && <SettingsMenu />}
  </PosedMenu >;
};

export default RightDrawer;

