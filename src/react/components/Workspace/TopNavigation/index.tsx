import './styles.scss';
import * as React from 'react';
import AppButton from './AppButton';
import MenuButton from './MenuButton';
import T from 'l10n';
import {getWorkspace} from '../../../../di-default';

const workspace = getWorkspace();

const TopNavigation = (): React.ReactElement => {
  console.debug('render TopNavigation');
  return <div className="top-navigation" >
    <AppButton />
    <h1 >
    </h1 >
    <MenuButton onClick={workspace.toggleFile} title={T`File`} />
    <MenuButton onClick={workspace.toggleTools} title={T`Features`} />
    <MenuButton onClick={workspace.toggleSources} title={T`Sources`} />
  </div >;
};

export default TopNavigation;
