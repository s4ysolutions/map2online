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

import {BaseEditor, Editor, Range, Transforms} from 'slate';
import {LinkElement, RichTextElement, RichTextElementType} from '../../../../../richtext';

export const isLinkActive = (editor: BaseEditor): boolean => {
  const [link] = Editor.nodes(editor, {
    match: (n: RichTextElement) =>
      !Editor.isEditor(n) && RichTextElement.isElement(n) && n.type === 'link',
  });
  return Boolean(link);
};

export const unwrapLink = (editor: BaseEditor):void => {
  Transforms.unwrapNodes(editor, {
    match: (n: RichTextElement): boolean =>
      !Editor.isEditor(n) && RichTextElement.isElement(n) && n.type === 'link',
  });
};

export const wrapLink = (editor: BaseEditor, url: string):void => {
  if (isLinkActive(editor)) {
    unwrapLink(editor);
  }

  const { selection } = editor;
  const isCollapsed = selection && Range.isCollapsed(selection);
  const link: LinkElement = {
    type: RichTextElementType.Link, //'link',
    url,
    children: isCollapsed ? [{ text: url }] : [],
  };

  if (isCollapsed) {
    Transforms.insertNodes(editor, link);
  } else {
    Transforms.wrapNodes(editor, link, { split: true });
    Transforms.collapse(editor, { edge: 'end' });
  }
};

export const insertLink = (editor: BaseEditor, url: string): void => {
  if (editor.selection) {
    wrapLink(editor, url)
  }
};
