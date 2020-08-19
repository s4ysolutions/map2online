import './styles.scss';
import * as React from 'react';
import CatalogButton from './CatalogButton';
import MenuButton from './MenuButton';
import T from 'l10n';
import {getCatalogUI, getWorkspace} from '../../../../di-default';
import log from '../../../../log';
import useObservable from '../../../hooks/useObservable';

const workspace = getWorkspace();
const catalogUI = getCatalogUI();

const deselectRoute = () => catalogUI.selectedRoute = null;
const deselectCategory = () => {
  catalogUI.selectedCategory = null;
  deselectRoute()
};

const TopNavigation = (): React.ReactElement => {
  log.render('TopNavigation');
  const selectedCategory = useObservable(catalogUI.selectedCategoryObservable(), catalogUI.selectedCategory);
  const selectedRoute = useObservable(catalogUI.selectedRouteObservable(), catalogUI.selectedRoute);

  return <div className="top-navigation" >
    <CatalogButton />
    <h1 ><span className={selectedCategory ? 'hasPointer' : ''} onClick={deselectCategory} >{T`AppTitle`}</span >
      {selectedCategory ? <span className={selectedRoute ? 'hasPointer' : ''}
                                onClick={deselectRoute} >{` - ${selectedCategory.title}`}</span > : ''}
      {selectedRoute ? ` - ${selectedRoute.title}` : ''}
    </h1 >
    <MenuButton onClick={workspace.toggleFile} title={T`File`} />
    <MenuButton onClick={workspace.toggleSettings} title={T`Settings`} />
    <MenuButton onClick={workspace.toggleSources} title={T`Sources`} />
    <MenuButton onClick={workspace.toggleAbout} title={T`About`} />
  </div >;
};

export default TopNavigation;
