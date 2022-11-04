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

import * as React from 'react';
import usePersistState from '../../hooks/usePersistState';
import {getLocalStorage} from '../../../di-default';
import {ReactNode} from 'react';
import SubMenu from './SubMenu';
import MenuItem from './MenuItem';
import './styles.scss';

const localStorage = getLocalStorage();

const MenuCollapsableItem: React.FunctionComponent<{
  id: string,
  title: string, children: ReactNode[] | ReactNode
}> =
  ({
    children,
    id,
    title,
  }): React.ReactElement => {

    const closed = usePersistState<boolean>(`menu_${id}`, false);
    const handleClick = () => localStorage.set(`menu_${id}`, !closed);

    return <MenuItem onClick={handleClick} title={title}>
      {closed ? <SubMenu >
        {children}
      </SubMenu > : null }
    </MenuItem>;
  };

export default MenuCollapsableItem;
