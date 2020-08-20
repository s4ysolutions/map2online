import './styles.scss';
import * as React from 'react';
import {useEffect} from 'react';
import Workspace from './Workspace';
import {hot} from 'react-hot-loader';
import useObservable from '../hooks/useObservable';
import {getCatalogUI} from '../../di-default';
import T from 'l10n';

const catalogUI = getCatalogUI();

const App: React.FunctionComponent = (): React.ReactElement => {
  const selectedCategory = useObservable(catalogUI.selectedCategoryObservable(), catalogUI.selectedCategory);
  const selectedRoute = useObservable(catalogUI.selectedRouteObservable(), catalogUI.selectedRoute);

  useEffect(() => {
    if (selectedCategory && selectedRoute) {
      window.document.title = `${T`AppTitle`} - ${selectedCategory.title} - ${selectedRoute.title}`;
    } else if (selectedCategory) {
      window.document.title = `${T`AppTitle`} - ${selectedCategory.title}`;
    } else {
      window.document.title = T`AppTitle`;
    }
  }, [selectedRoute, selectedCategory]);

  return <div className="application" >
    <Workspace />
  </div >;
};

export default hot(module)(App);
