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
import {BaseEditor, Editor, Node, Transforms} from 'slate';
import Icon from '../Icon';
import {RichTextElement, RichTextElementType} from '../../../../richtext';

const isBlockActive = (editor: BaseEditor, format: RichTextElementType) => {
  const { selection } = editor;
  log.slate('BlockButton.isBlockActive', {format, editor, selection});
  if (!selection) {
    return false;
  }

  const [match] = Array.from(Editor.nodes(editor, {
    at: Editor.unhangRange(editor, selection),
    match: (node: Node): boolean => !Editor.isEditor(node) && RichTextElement.isElement(node) && node.type === format,
  }));

  return Boolean(match);
};

const LIST_TYPES = ['numbered-list', 'bulleted-list'];
const toggleBlock = (editor: Editor, format: RichTextElementType) => {
  const isActive = isBlockActive(editor, format);
  const isList = LIST_TYPES.includes(format);

  log.slate('BlockButton.toogleBlock', {format, isActive, isList});

  Transforms.unwrapNodes(editor, {
    match: (node: Node): boolean =>
      !Editor.isEditor(node) &&
      RichTextElement.isElement(node) &&
      (LIST_TYPES.includes(node.type) || node.type === RichTextElementType.BlockQuote),
    split: true,
  });

  const newProperties: Partial<RichTextElement> = {
    type: isActive ? RichTextElementType.Paragraph : isList ? RichTextElementType.ListItem : format,
  };

  Transforms.setNodes<Node>(editor, newProperties);

  if (!isActive && isList) {
    const block = { type: format, children: [] as Array<Node> };
    Transforms.wrapNodes(editor, block);
  }
};

const BlockButton = ({ format, icon }: {format: RichTextElementType, icon: string }): ReactElement => {
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
