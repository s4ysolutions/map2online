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

interface Props {
  on: boolean;
  onClick: () => void;
  children: ReactNode[] | ReactNode;
}

const Tab: React.FunctionComponent<Props> = ({on, children, onClick}): React.ReactElement =>
  <button className={`tab menu-item ${on ? 'on' : 'off'}`} onClick={onClick} type="button" >
    {children}
  </button >
;

export default Tab;
