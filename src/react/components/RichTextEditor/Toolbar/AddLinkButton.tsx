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
import {useSelected, useSlate} from 'slate-react';
import Button from './Button';
import log from '../../../../log';
import Icon from '../Icon';
import {insertLink, isLinkActive} from '../Editor/link/lib';

const AddLinkButton = (): ReactElement => {
  const editor = useSlate();
  const active = isLinkActive(editor);
  log.render('RichText Toolbar AddLinkButton', {active});
  return (
    <Button
      active={active}
      onMouseDown={(event: MouseEvent) => {
        event.preventDefault();
        const url = window.prompt('Enter the URL of the link:').trim();
        if (!url) return;
        insertLink(editor, url)
      }}
    >
      <Icon symbol="link"/>
    </Button>
  )
};

export default AddLinkButton;