import './styles.scss';
import React, {FormEvent} from 'react';
import Modal from '../Modal';
import {getImportUI, getParser} from '../../../di-default';
import T from '../../../l10n';
import FileUpload from '../FileUpload';
import useObservable from '../../hooks/useObservable';
import {ParsingStatus} from '../../../importer';
import {CATEGORY_DEPTH, getImportedFolderStats} from '../../../importer/post-process';

const importUI = getImportUI();
const parser = getParser();

const cancelEvent: (ev: FormEvent) => void = (ev: FormEvent) => ev.preventDefault();

const parse = (fileList: FileList) => {
  parser.parse(fileList);
};

const categoryName = (): string => {
  const dt = new Date();
  return `${dt.getFullYear()}-${dt.getMonth()}-${dt.getDay()}-${dt.getHours()}-${dt.getMinutes()}-${dt.getSeconds()}`;
};

const Import: React.FunctionComponent = (): React.ReactElement => {
  const parseState = useObservable<ParsingStatus>(parser.statusObservable(), parser.status);
  const parseStats = getImportedFolderStats(parseState.rootFolder);

  const importToCategory = React.useCallback(() => {
    /*
     *const categoryProps: CategoryProps = {
     *  description: '', id: makeId(), summary: '', title: categoryName(), visible: true,
     *};
     *catalog.categories.add(categoryProps).then(category => {
     *  const defaultRoute = category.routes.byPos(0);
     *  return importAllToCategory(parseState.importedFolders, category).then(() => category.routes.remove(defaultRoute));
     *});
     */
  }, [parseState]);

  return <Modal className="import-dialog" onClose={importUI.close} >
    <form onSubmit={cancelEvent} >
      <h2 >
        {T`Import KML`}
      </h2 >
      <div className="import" >
        <div className="upload-area" >
          {window.File && window.FileReader && window.FileList && window.Blob && <FileUpload onUpload={parse} /> ||
          <div >
            File Upload is not supported
          </div >}
        </div >
        {parseState.rootFolder.folders.length > 0 && parseState.rootFolder.features.length > 0 &&
        <div className="upload-results" >
          {parseStats.mixed.length > 0 &&
          <React.Fragment >
            <h3 >
              {T`Problem: Some folders have both features and subfolders`}
            </h3 >
            <p >
              <strong >
                {T`Possible actions:`}
              </strong >
            </p >
            <ul >
              <li >
                {T`Cancel import and fix the file manually`}
              </li >
              <li >
                {T`Ignore and go on with the import. A route will be aute created for the features`}
              </li >
            </ul >
          </React.Fragment >}
          {parseStats.levels > CATEGORY_DEPTH &&
          <React.Fragment >
            <h3 >
              {T`Problem: Some folders have more than 2 levels on nesting`}
            </h3 >
            <p >
              <strong >
                {T`Possible actions:`}
              </strong >
            </p >
            <ul >
              <li >
                {T`Cancel import and fix the file manually`}
              </li >
              <li >
                {T`Ignore and go on with the import. Only the 2 levels of folder will be used for import`}
              </li >
            </ul >
          </React.Fragment >}
        </div >}
      </div >
      <div className="buttons-row" >
        <button onClick={importToCategory} type="button" >
          {T`Import`}
        </button >
        <button onClick={importUI.close} type="button" >
          {T`Close`}
        </button >
      </div >
    </form >

  </Modal >;
};

export default Import;
