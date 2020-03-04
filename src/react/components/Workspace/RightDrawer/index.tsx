import FileMenu from '../../FileMenu';
import MapSourcesMenu from '../../MapSourcesMenu';
import React from 'react';
import posed from 'react-pose';
import {tween} from 'popmotion';
import log from '../../../../log';
import {getWorkspace} from '../../../../di-default';
import useObservable from '../../../hooks/useObservable';

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
  log.render(`RightDrawer fileMenu=${stateFile} sourceMenu=${stateSources}`);
  return <PosedMenu className="right-drawer" pose={stateFile || stateSources ? 'show' : 'hide'} >
    {stateSources && <MapSourcesMenu />}
    {stateFile && <FileMenu />}
  </PosedMenu >;
};

export default RightDrawer;

