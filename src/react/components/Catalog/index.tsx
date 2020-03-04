import './styles.scss';
import * as React from 'react';

const Catalog: React.FunctionComponent = (): React.ReactElement => {
  return <div className="catalog" >
    AAA;
  </div >;
};

export default Catalog;
/*
const Catalog: React.FunctionComponent = (): React.ReactElement => {
  const catalog = React.useContext(contextCatalog);
  const topFolder = catalog.topFolderOpened();
  const featuresFolder = catalog.featuresFolderOpened();
  rd(`Catalog topFolder=${
    topFolder && topFolder.id || null
  } featuresFolder=${featuresFolder && featuresFolder.id || null}`);

  return <div className="catalog">
    {topFolder && featuresFolder
      ? <Features parent={featuresFolder} />
      : topFolder
        ? <Folders folders={catalog.featuresFolders(topFolder)} level={Level.FEATURES} parent={topFolder} />
        : <Folders folders={catalog.topFolders()} level={Level.TOP} parent={catalog.root()} />
    }
    <CatalogNavigation />
  </div>;
};

 */
