import React, {FormEvent} from 'react';
import Modal from '../Modal';
import {getCatalog, getImportUI, getKMLParser} from '../../../di-default';
import T from '../../../l10n';
import FileUpload from '../FileUpload';
import useObservable from '../../hooks/useObservable';
import {flatImportedFolders, importAllToCategory, ParsingStatus} from '../../../importer';
import {CategoryProps} from '../../../app-rx/catalog';
import {makeId} from '../../../l10n/id';

const importUI = getImportUI();
const kmlParser = getKMLParser();
const catalog = getCatalog();

const cancelEvent: (ev: FormEvent) => void = (ev: FormEvent) => ev.preventDefault();

const kmlParse = (fileList: FileList) => {
  kmlParser.parse(fileList);
};

const categoryName = (): string => {
  const dt = new Date();
  return dt.getFullYear() + '-' + dt.getMonth() + '-' + dt.getDay() + '-' + dt.getHours() + '-' + dt.getMinutes() + '-' + dt.getSeconds();
};

const Import: React.FunctionComponent = (): React.ReactElement => {
  const parseState = useObservable<ParsingStatus>(kmlParser.statusObservable(), kmlParser.status);

  const importToCategory = React.useCallback(() => {
    const categoryProps: CategoryProps = {
      description: '', id: makeId(), summary: '', title: categoryName(), visible: true
    };
    catalog.categories.add(categoryProps).then(category => {
      const defaultRoute = category.routes.byPos(0);
      return importAllToCategory(parseState.importedFolders, category).then(() => category.routes.remove(defaultRoute))
    });
  }, [parseState]);

  return <Modal className='form' onClose={importUI.close} >
    <form onSubmit={cancelEvent} >
      <h2 >
        {T`Import KML`}
      </h2 >
      <div className="field-row" >
        {window.File && window.FileReader && window.FileList && window.Blob && <FileUpload onUpload={kmlParse} /> ||
        <div > File Upload is not supported</div >}
      </div >
      {parseState.importedFolders.length > 0 &&
      <div className="field-row" >
        Found {flatImportedFolders(parseState.importedFolders).length} routes
      </div >
      }
      <div className="buttons-row" >
        <button onClick={importToCategory} >
          {T`Import`}
        </button >
        <button onClick={importUI.close} >
          {T`Close`}
        </button >
      </div >
    </form >

  </Modal >
};

export default Import;
