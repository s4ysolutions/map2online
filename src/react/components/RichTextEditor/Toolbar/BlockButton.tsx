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
import {BaseEditor, Editor, Node, Element as SlateElement, Transforms} from 'slate';
import Icon from '../Icon';
import {RichTextElement, RichTextElementType} from '../../../../richtext';

const isBlockActive = (editor: BaseEditor, format: string) => {
  const { selection } = editor;
  if (!selection) {
    return false;
  }

  const [match] = Array.from(Editor.nodes(editor, {
    at: Editor.unhangRange(editor, selection),
    match: (n: RichTextElement): boolean => !Editor.isEditor(n) && RichTextElement.isElement(n) && n.type === format,
  }));
  log.d('log toolbar isBlockActive', {match});

  return Boolean(match);
};

const LIST_TYPES = ['numbered-list', 'bulleted-list'];
const toggleBlock = (editor: Editor, format: string) => {
  const isActive = isBlockActive(editor, format);
  const isList = LIST_TYPES.includes(format);

  Transforms.unwrapNodes(editor, {
    match: (n: RichTextElement): boolean =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      LIST_TYPES.includes(n.type) || n.type === RichTextElementType.BlockQuote,
    split: true,
  });

  const newProperties: Partial<RichTextElement> = {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    type: isActive ? 'paragraph' : isList ? 'list-item' : format,
  };

  Transforms.setNodes<Node>(editor, newProperties);

  if (!isActive && isList) {
    const block = { type: format, children: [] as Array<Node> };
    Transforms.wrapNodes(editor, block);
  }
};

const BlockButton = ({ format, icon }: {format: string, icon: string }): ReactElement => {
  log.render('RichText Toolbar BlockButton');

  const editor = useSlate();
  return <Button
    active={isBlockActive(editor, format)}
    onMouseDown={(event: MouseEvent) => {
      event.preventDefault();
      toggleBlock(editor, format);
    }}
  >
    <Icon symbol={icon} />
  </Button>;
};

export default BlockButton;
