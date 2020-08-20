import './styles.scss';
import * as React from 'react';
import CatalogNavigation from './CatalogNavigation';
import FeaturesView from './FeaturesView';
import {getCatalogUI, getWorkspace} from '../../../di-default';
import useObservable from '../../hooks/useObservable';
import log from '../../../log';
import CategoriesView from './CategoriesView';
import RoutesView from './RoutesView';

const catalog = getCatalogUI();
const workspace = getWorkspace();

const Catalog: React.FunctionComponent<{}> = (): React.ReactElement => {
  const openCatalog = useObservable(workspace.catalogObservable(), workspace.catalogOpen)
  const selectedCategory = useObservable(catalog.selectedCategoryObservable(), catalog.selectedCategory);
  const selectedRoute = useObservable(catalog.selectedRouteObservable(), catalog.selectedRoute);
  log.render(`Catalog open=${openCatalog} category=${selectedCategory} route=${selectedRoute}`);

  return openCatalog && <div className="catalog" >
    {selectedCategory && selectedRoute
      ? <FeaturesView route={selectedRoute} />
      : selectedCategory
        ? <RoutesView category={selectedCategory} />
        : <CategoriesView />
    }
    <CatalogNavigation />
  </div >;
};

export default Catalog;
