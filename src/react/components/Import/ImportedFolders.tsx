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

/* eslint-disable react/no-array-index-key */
import React from 'react';
import {ImportedFolder} from '../../../importer';
import FolderCategory from '../Svg/FolderCategory';
import FolderRoute from '../Svg/FolderRoute';
import T from '../../../l10n';
import {isFlatRoot} from '../../../importer/post-process';

const Route: React.FunctionComponent<{ folder: ImportedFolder }> = ({folder}): React.ReactElement =>
  <div className="route" >
    <FolderRoute />
    <span className="title" >
      {folder.name}
    </span >
    <strong >
      &nbsp;(
      {folder.features.length}
      )
    </strong >
  </div >;

const Orphan: React.FunctionComponent<{ folder: ImportedFolder }> = ({folder}): React.ReactElement =>
  <div className="route" >
    <FolderRoute />
    <span className="title" >
      {T`Orphan`}
    </span >
    <strong >
      &nbsp;(
      {folder.features.length}
      )
    </strong >
  </div >;

const NotRoute: React.FunctionComponent<{ folder: ImportedFolder }> = ({folder}): React.ReactElement =>
  <div className="notroute" >
    {!isFlatRoot(folder) && folder.folders.length > 0 && <FolderCategory />}
    {!isFlatRoot(folder) &&
    <span className="title" >
      {folder.name}
    </span >}
    <div className="folders" >
      {folder.features.length > 0 && folder.folders.length > 0 && <Orphan folder={folder} />}
      {folder.folders.map((f, i) => <Entry
        folder={f}
        key={`${folder.level}-${i}`} />)}
    </div >
  </div >;

const Entry: React.FunctionComponent<{ folder: ImportedFolder }> = ({folder}): React.ReactElement =>
  <React.Fragment >
    {folder.features.length > 0 && folder.folders.length === 0 && <Route folder={folder} />}
    {folder.folders.length > 0 && <NotRoute folder={folder} />}
  </React.Fragment >;

const ImportedFolders: React.FunctionComponent<{ folder: ImportedFolder }> = ({folder}): React.ReactElement =>
  <div className="imported-folders" >
    <Entry folder={folder} />
  </div >;

export default ImportedFolders;
