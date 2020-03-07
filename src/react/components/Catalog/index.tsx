import './styles.scss';
import * as React from 'react';
import CatalogNavigation from './CatalogNavigation';
import FeaturesView from './FeaturesView';
import {getCatalogUI} from '../../../di-default';
import useObservable from '../../hooks/useObservable';
import log from '../../../log';
import CategoriesView from './CategoriesView';
import RoutesView from './RoutesView';

const catalog = getCatalogUI();

const Catalog: React.FunctionComponent<{}> = (): React.ReactElement => {
  const selectedCategory = useObservable(catalog.selectedCategoryObservable(), catalog.selectedCategory);
  const selectedRoute = useObservable(catalog.selectedRouteObservable(), catalog.selectedRoute);
  log.render(`Catalog category=${selectedCategory} route=${selectedRoute}`);

  return <div className="catalog" >
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
