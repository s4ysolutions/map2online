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
import {ReactNode} from 'react';

const MenuButton: React.FunctionComponent<{ title: string, onClick: React.MouseEventHandler, children?: ReactNode[] | ReactNode }> =
  ({title, children, onClick}): React.ReactElement =>
    <button className="menu-item" onClick={onClick} type="button" >
      {children}

      <div className="title" >
        {title}
      </div >
    </button >
;

export default MenuButton;
