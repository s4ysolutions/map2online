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

import React, {ReactElement} from 'react';
import {RenderElementProps, useSelected} from 'slate-react';
import log from '../../../../../log';
import './style.scss';
import {LinkElement} from '../../../../../richtext';

const NON_BREAKING_SPACE_CODE = 160;

export type LinkProps =
  Omit<RenderElementProps, 'children'> & { element: LinkElement, children? : React.ReactNode | React.ReactNode[]};

const InlineChromiumBugfix = (): ReactElement =>
  <span className="inline-chromium-bugfix" contentEditable={false}>
    $
    {String.fromCodePoint(NON_BREAKING_SPACE_CODE) /* Non-breaking space */}
  </span>;

const Link = (props: LinkProps): ReactElement => {
  const {attributes, element, children} = props;
  const selected = useSelected();
  log.render('RichText Link', {attributes, element, selected});
  return <a
    {...attributes}
    className={`${selected ? 'selected' : ''}`}
    href={element.url}>
    {children ? <InlineChromiumBugfix /> : null}

    {children}

    {children ? <InlineChromiumBugfix /> : null}
  </a>;
};

export default Link;
