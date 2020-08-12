import './styles.scss';
import * as React from 'react';
import CatalogButton from './CatalogButton';
import MenuButton from './MenuButton';
import T from 'l10n';
import {getWorkspace} from '../../../../di-default';
import log from '../../../../log';

const workspace = getWorkspace();

const TopNavigation = (): React.ReactElement => {
  log.render('TopNavigation');
  return <div className="top-navigation" >
    <CatalogButton />
    <h1 >{T`AppTitle`} </h1 >
    <MenuButton onClick={workspace.toggleFile} title={T`File`} />
    <MenuButton onClick={workspace.toggleSources} title={T`Sources`} />
    <MenuButton onClick={workspace.toggleSettings} title={T`Settings`} />
  </div >;
};

export default TopNavigation;
