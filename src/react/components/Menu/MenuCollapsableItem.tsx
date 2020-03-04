import * as React from 'react';
import usePersistState from '../../hooks/usePersistState';
import {getLocalStorage} from '../../../di-default';

interface Props {
  id: string;
}

const localStorage = getLocalStorage();

const MenuCollapsableItem: React.FunctionComponent<Props> = ({children, id}): React.ReactElement => {
  const closed = usePersistState<boolean>(`menu_${id}`, false);

  return <div
    className={closed ? 'menu-item closed' : 'menu-item'}
    onClick={(): void => localStorage.set(`menu_${id}`, !closed)} >
    {children}
  </div >;
};

export default MenuCollapsableItem;
