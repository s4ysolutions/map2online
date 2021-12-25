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

import React, {MouseEvent} from 'react';
import Button from './Button';
import {ReactElement} from 'react';
import log from '../../../../log';
import Icon from '../Icon';
import {useSlate} from 'slate-react';
import {Editor} from 'slate';

const isMarkActive = (editor: Editor, format: string): boolean => {
  const marks: {[key: string]: boolean} = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

const toggleMark = (editor: Editor, format: string) => {
  const isActive = isMarkActive(editor, format);
  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

const MarkButton = ({format, icon}: {format: string, icon: string }): ReactElement => {
  log.render('RichText Toolbar MarkButton');
  const editor = useSlate();

  return <Button
    active={isMarkActive(editor, format)}
    onMouseDown={(event: MouseEvent) => {
      event.preventDefault();
      toggleMark(editor, format);
    }}
  >
    <Icon symbol={icon} />
  </Button >;
};

export default MarkButton;
