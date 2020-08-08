import * as React from 'react';
import {getWording, getWorkspace} from '../../../../di-default';
import useObservable from '../../../hooks/useObservable';
import log from '../../../../log';
import MenuButton from './MenuButton';
import FolderOpen from '../../Svg/FolderOpen';
import FolderClose from '../../Svg/FolderClose';

const workspace = getWorkspace();
const wording = getWording();

const CatalogButton = (): React.ReactElement => {
  log.render('AppButton');
  const show = useObservable(workspace.catalogObservable(), workspace.catalogOpen, 'AppButton');
  return <MenuButton onClick={workspace.toggleCatalog} title={wording.C('Catalog')} >
    {show ? <FolderOpen /> : <FolderClose />}
  </MenuButton >;
};

export default CatalogButton;
