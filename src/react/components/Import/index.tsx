/*
 * Copyright 2019 s4y.solutions
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import './styles.scss';
import React, {FormEvent} from 'react';
import Modal from '../Modal';
import {getCatalog, getCatalogUI, getImportUI, getParser, getWording} from '../../../di-default';
import T from '../../../l10n';
import FileUpload from '../FileUpload';
import useObservable from '../../hooks/useObservable';
import {ParsingStatus} from '../../../importer';
import {CATEGORY_DEPTH, isFlatRoot} from '../../../importer/post-process';
import ImportedFolders from './ImportedFolders';
import {getImportedFolderStats} from '../../../importer/stats';
import {ImportTo, importFlatFolders} from '../../../importer/import-to';
import {setSpinnerActive} from '../Spinner/hooks/useSpinner';

const catalog = getCatalog();
const catalogUI = getCatalogUI();
const importUI = getImportUI();
const parser = getParser();
const wording = getWording();

const cancelEvent: (ev: FormEvent) => void = (ev: FormEvent) => ev.preventDefault();

/*
 *const categoryName = (): string => {
 *  const dt = new Date();
 *  return `${dt.getFullYear()}-${dt.getMonth()}-${dt.getDay()}-${dt.getHours()}-${dt.getMinutes()}-${dt.getSeconds()}`;
 *};
 */

const RENDER_DELAY = 50;
const Import: React.FunctionComponent = (): React.ReactElement => {
  const parseState = useObservable<ParsingStatus>(parser.statusObservable(), parser.status);
  const parseStats = getImportedFolderStats(parseState.rootFolder);

  const [inProgress, setInProgress] = React.useState<boolean>(false);
  const importTo = useObservable(importUI.importToObservable(), importUI.importTo);

  const handleUpload = React.useCallback((files: FileList) => {
    setInProgress(true); // TODO, handle import completed but no features
    setSpinnerActive(true); // TODO, handle import completed but no features
    setTimeout(
      () => parser.parse(files).then(() => setSpinnerActive(false))
        .catch(() => setSpinnerActive(false)),
      RENDER_DELAY,
    );
  }, [setInProgress]);

  const handleImport = React.useCallback(() => {
    setSpinnerActive(true);
    setTimeout(() => {
      importFlatFolders(parseState.rootFolder, importTo, catalog, catalogUI.activeCategory, catalogUI.activeRoute)
        .then(() => {
          setSpinnerActive(false);
          importUI.visible = false;
        })
        .catch(() => setSpinnerActive(false));
    }, RENDER_DELAY);
  }, [parseState, importTo]);

  const mixProblem = parseStats.mixed.length > 0;
  const flatProblem = !isFlatRoot(parseState.rootFolder) && parseStats.depth >= CATEGORY_DEPTH;

  return <Modal className="import-dialog" onClose={importUI.close} >
    <form onSubmit={cancelEvent} >
      <h2 >
        {T`Import KML`}
      </h2 >
      <div className="import" >
        <div className="upload-area" >
          {window.File && window.FileReader && window.FileList && window.Blob &&
          <FileUpload onUpload={handleUpload} /> ||
          <div >
            File Upload is not supported
          </div >}
        </div >
        {inProgress &&
        <div className="upload-results" >
          <em >
            {wording.C('Found categories: ') + parseStats.categories}
          </em >
          <em className="last">
            {wording.R('Found routes: ') + parseStats.routes}
          </em >
          <ImportedFolders folder={parseState.rootFolder} />
          {mixProblem &&
          <div className="import-problem">
            <em >
              {T`Problem: Some folders have both features and subfolders`}
            </em >
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
                <button className="fix-import" onClick={() => parser.convertMixedToRoutes()} type="button" >
                  {T`Click fix the file automatically`}
                </button >
              </li >
            </ul >
          </div >}
          {flatProblem && !mixProblem &&
          <div className="import-problem">
            <em >
              {T`Problem: Some folders have more than 2 levels on nesting`}
            </em >
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
                <button className="fix-import" onClick={() => parser.flatCategories()} type="button" >
                  {T`Click fix the file automatically`}
                </button >
              </li >
            </ul >
          </div >}
          <div className="import-kind">
            <label >
              <input
                checked={importTo === ImportTo.ALL_FEATURES_TO_ACTIVE_ROUTE}
                name="import_to"
                onChange={() => {
                  importUI.importTo = ImportTo.ALL_FEATURES_TO_ACTIVE_ROUTE;
                }}
                type="radio"
                value={ImportTo.ALL_FEATURES_TO_ACTIVE_ROUTE} />
              {wording.R('Import all features into the active route')}
              &nbsp;
            </label >
          </div >
          {parseStats.routes === 1 &&
          <div className="import-kind">
            <label >
              <input
                checked={importTo === ImportTo.ALL_ROUTES_TO_CATEGORY}
                name="import_to"
                onChange={() => {
                  importUI.importTo = ImportTo.ALL_ROUTES_TO_CATEGORY;
                }}
                type="radio"
                value={ImportTo.ALL_ROUTES_TO_CATEGORY} />
              {wording.CR('Import the route into the active category')}
              &nbsp;
            </label >
          </div >}
          {parseStats.routes > 1 &&
          <div className="import-kind">
            <label >
              <input
                checked={importTo === ImportTo.ALL_ROUTES_TO_CATEGORY}
                name="import_to"
                onChange={() => {
                  importUI.importTo = ImportTo.ALL_ROUTES_TO_CATEGORY;
                }}
                type="radio"
                value={ImportTo.ALL_ROUTES_TO_CATEGORY} />
              {wording.CR('Import all routes into the active category')}
              &nbsp;
            </label >
          </div >}
          {parseStats.categories > 0 &&
          <div className="import-kind">
            <label >
              <input
                checked={importTo === ImportTo.ALL_CATEGORIES_TO_CATALOG}
                name="import_to"
                onChange={() => {
                  importUI.importTo = ImportTo.ALL_CATEGORIES_TO_CATALOG;
                }}
                type="radio"
                value={ImportTo.ALL_CATEGORIES_TO_CATALOG} />
              {wording.C('Import the categories into the catalog')}
              &nbsp;
            </label >
          </div >}
        </div >}
      </div >
      <div className="buttons-row" >
        <button onClick={importUI.close} type="button" >
          {T`Cancel`}
        </button >
        {!mixProblem && !flatProblem && parseState.rootFolder.folders.length > 0 &&
        <button onClick={handleImport} type="button" >
          {T`Import`}
        </button >}
      </div >
    </form >
  </Modal >;
};

export default Import;
