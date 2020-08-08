import './styles.scss';
import * as React from 'react';
import CatalogButton from './CatalogButton';
import MenuButton from './MenuButton';
import T from 'l10n';
import {getWorkspace} from '../../../../di-default';

const workspace = getWorkspace();

const TopNavigation = (): React.ReactElement => {
  console.debug('render TopNavigation');
  return <div className="top-navigation" >
    <CatalogButton />
    <h1 >{T`AppTitle`} </h1 >
    <MenuButton onClick={workspace.toggleFile} title={T`File`} />
    <MenuButton onClick={workspace.toggleSources} title={T`Sources`} />
    <MenuButton onClick={workspace.toggleSettings} title={T`Settings`} />
  </div >;
};

export default TopNavigation;
