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

interface Props {
  id: string
  children: ReactNode[] | ReactNode
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
