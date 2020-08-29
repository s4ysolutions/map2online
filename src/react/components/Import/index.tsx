import './styles.scss';
import React, {FormEvent} from 'react';
import Modal from '../Modal';
import {getImportUI, getParser} from '../../../di-default';
import T from '../../../l10n';
import FileUpload from '../FileUpload';
import useObservable from '../../hooks/useObservable';
import {ParsingStatus} from '../../../importer';
import {CATEGORY_DEPTH, isFlatRoot} from '../../../importer/post-process';
import ImportedFolders from './ImportedFolders';
import {getImportedFolderStats} from '../../../importer/stats';

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
  console.log('debug parseStats', {parseStats, parseState});

  const [inProgress, setInProgress] = React.useState<boolean>(false);

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
          {window.File && window.FileReader && window.FileList && window.Blob && <FileUpload onUpload={(files) => {
            setInProgress(true); // TODO, handle import completed but no features
            parse(files);
          }} /> ||
          <div >
            File Upload is not supported
          </div >}
        </div >
        {inProgress &&
        <div className="upload-results" >
          <h3 >
            {T`Found categories: ` + parseStats.categories}
          </h3 >
          <h3 >
            {T`Found routes: ` + parseStats.routes}
          </h3 >
          <ImportedFolders folder={parseState.rootFolder} />
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
                {T`Click on the button below to fix the file automatically`}
                <button onClick={() => parser.convertMixedToRoutes()} type="button" >
                  {T`Fix`}
                </button >
              </li >
            </ul >
          </React.Fragment >}
          {!isFlatRoot(parseState.rootFolder) && parseStats.depth >= CATEGORY_DEPTH && parseStats.mixed.length === 0 &&
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
                {T`Click on the button below to fix the file automatically`}
                <button onClick={() => parser.flatCategories()} type="button" >
                  {T`Fix`}
                </button >
              </li >
            </ul >
          </React.Fragment >}
          <div >
            <input name="import_to" type="radio" />
            <label >
              {T`Import all features into the active route`}
              &nbsp;
            </label >
          </div >
          {parseStats.routes === 1 && parseStats.categories === 0 &&
          <div >
            <input name="import_to" type="radio" />
            <label >
              {T`Import the route into the active category`}
              &nbsp;
            </label >
          </div >}
          {parseStats.routes > 1 &&
          <div >
            <input name="import_to" type="radio" />
            <label >
              {T`Import all routes into the active category`}
              &nbsp;
            </label >
          </div >}
          {parseStats.categories > 0 &&
          <div >
            <input name="import_to" type="radio" />
            <label >
              {T`Import the categories into the catalog`}
              &nbsp;
            </label >
          </div >}
        </div >}
      </div >
      <div className="buttons-row" >
        <button onClick={importUI.close} type="button" >
          {T`Cancel`}
        </button >
        <button onClick={importToCategory} type="button" >
          {T`Import`}
        </button >
      </div >
    </form >

  </Modal >;
};

export default Import;
