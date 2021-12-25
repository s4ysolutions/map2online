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

import React, {MouseEvent, ReactElement} from 'react';
import {useSlate} from 'slate-react';
import Button from './Button';
import log from '../../../../log';
import Icon from '../Icon';
import {isLinkActive, unwrapLink} from '../Editor/link/lib';

const RemoveLinkButton = (): ReactElement => {
  log.render('RichText Toolbar RemoveLinkButton');
  const editor = useSlate();
  return (
    <Button
      active={!isLinkActive(editor)}
      onMouseDown={(event: MouseEvent) => {
        event.preventDefault();
        if (isLinkActive(editor)) {
          unwrapLink(editor);
        }
      }}
    >
      <Icon symbol="link_off" />
    </Button>
  )
};

export default RemoveLinkButton;