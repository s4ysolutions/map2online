/*
 * Copyright 2021 s4y.solutions
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

import React, {MouseEventHandler, PropsWithChildren, ReactElement, ReactNode} from 'react';
import log from '../../../../log';

type ButtonProps = { className?: string, active?: boolean, reversed?: boolean, children: ReactNode, onMouseDown?: MouseEventHandler | undefined; };

const Button =
  ({
    className,
    active,
    reversed,
    ...props
  }: PropsWithChildren<ButtonProps>): ReactElement => {
    log.render('RichText Toolbar Button');
    return <span {...props} className={`${className || ''} button ${reversed ? 'reversed' : ''} ${active ? 'active' : ''}`} />;
  };

export default Button;
