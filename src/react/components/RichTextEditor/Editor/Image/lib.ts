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

import {BaseEditor, Transforms, Node} from 'slate';
import isUrl from 'is-url';
import imageExtensions from 'image-extensions';
import {StyledText} from '../../../../../richtext';

type ImageElement = {
  type: 'image'
  url: string
  children: StyledText[]
}

export const insertImage = (editor: BaseEditor, url: string): void => {
  const image: ImageElement = { type: 'image', url, children: [] };
  const trailingPara = {type: 'paragraph', children: [{text: ''}]} as unknown as Node;
  Transforms.insertNodes(editor, image);
  Transforms.insertNodes(editor, trailingPara);
};

export const isImageUrl = (url: string): boolean => {
  if (!url) {
    return false;
  }
  if (!isUrl(url)) {
    return false;
  }
  const ext = new URL(url).pathname.split('.').pop();
  return imageExtensions.includes(ext);
};
