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
import {ReactEditor, RenderElementProps, useFocused, useSelected, useSlateStatic} from 'slate-react';
import {Transforms} from 'slate';
import Button from '../../Toolbar/Button';
import Icon from '../../Icon';
import log from '../../../../../log';
import './style.scss';
import {ImageElement} from '../../../../../richtext';

export type ImageProps = RenderElementProps & { element: ImageElement };

const Image = (props: ImageProps): ReactElement => {
  const {attributes, element, children} = props;
  const editor = useSlateStatic();
  const path = ReactEditor.findPath(editor as ReactEditor, element);
  log.render('RichText Image', {attributes, element, path});

  const selected = useSelected();
  const focused = useFocused();
  return (
    <div {...attributes} className="image" contentEditable={false} >

      {children}

      <img
        alt=""
        className={`${focused ? 'focused' : ''} ${selected ? 'selected' : ''}`}
        src={element.url} />

      <Button
        active
        className={`${focused ? 'focused' : ''} ${selected ? 'selected' : ''}`}
        onMouseDown={(event: MouseEvent) => {
          event.preventDefault();
          Transforms.removeNodes(editor, {at: path});
        }}
      >
        <Icon symbol="delete" />
      </Button >
    </div >
  );
};

export default Image;
