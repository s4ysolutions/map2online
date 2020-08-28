/* eslint-disable react/no-array-index-key */
import React from 'react';
import {ImportedFolder} from '../../../importer';
import FolderCategory from '../Svg/FolderCategory';
import FolderRoute from '../Svg/FolderRoute';

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

const NotRoute: React.FunctionComponent<{ folder: ImportedFolder }> = ({folder}): React.ReactElement =>
  <div className="notroute" >
    {folder.folders.length > 0 && <FolderCategory />}
    <span className="title" >
      {folder.name}
    </span >
    <div className="folders" >
      {folder.folders.map((f, i) => <Entry
        folder={f}
        key={`${folder.level}-${i}`} />)}
    </div >
  </div >;

const Entry: React.FunctionComponent<{ folder: ImportedFolder }> = ({folder}): React.ReactElement =>
  <React.Fragment >
    {folder.features.length > 0 && <Route folder={folder} />}
    {folder.folders.length > 0 && <NotRoute folder={folder} />}
  </React.Fragment >;

const ImportedFolders: React.FunctionComponent<{ folder: ImportedFolder }> = ({folder}): React.ReactElement =>
  <div className="imported-folders" >
    <Entry folder={folder} />
  </div >;

export default ImportedFolders;
