import * as React from 'react';
import {getCatalogUI, getWording} from '../../../di-default';
import useObservable from '../../hooks/useObservable';

const catalogUI = getCatalogUI();
const wording = getWording();

const deselectRoute = () => catalogUI.selectedRoute = null;
const deselectCategory = () => {
  catalogUI.selectedCategory = null;
  deselectRoute()
};

const CatalogNavigation: React.FunctionComponent<{}> = (): React.ReactElement => {
  const selectedCategory = useObservable(catalogUI.selectedCategoryObservable(), catalogUI.selectedCategory);
  const selectedRoute = useObservable(catalogUI.selectedRouteObservable(), catalogUI.selectedRoute);

  return <div className="catalog-navigation" >
    <button onClick={deselectCategory} type="button" disabled={!selectedCategory} >
      <svg viewBox="0 0 512 512" >
        <path
          d="m260.29 85.236-61.143-62.391h-182.64v482.15h495.48v-419.76zm93.369 218.37-79.495-83.441v205.67h-19.819v-205.67l-79.49 83.441-14.535-13.109 103.93-109.1 103.94 109.1z"
          opacity=".3"
          strokeWidth="2.0366"
        />
        <path
          d="m243.78 69.164-61.143-62.391h-182.64v482.15h495.48v-419.76zm93.369 218.37-79.495-83.441v205.67h-19.819v-205.67l-79.49 83.441-14.535-13.109 103.93-109.1 103.94 109.1z"
          fill="#fff"
          strokeWidth="2.0366"
        />
      </svg >
    </button >


    {!selectedCategory && !selectedRoute && <span className="title" >
      {wording.C('Catalog')}
    </span >}

    {selectedCategory && !selectedRoute && <span className="title" >
      {selectedCategory.title}
    </span >}

    {selectedCategory && selectedRoute && [
      <button key="button" onClick={deselectRoute} type="button" >
        {selectedCategory.title}
      </button >,
      <span className="title" key="title" >
        {selectedRoute.title}
      </span >,
    ]}
  </div >
};

export default CatalogNavigation;
