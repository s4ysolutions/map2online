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
import {StyledText} from '../../../../richtext';
import log from '../../../../log';
import {RenderElementProps} from 'slate-react';

type LeafProps = RenderElementProps & {leaf: StyledText};

const Leaf = (props: LeafProps): ReactElement => {
  const { attributes, children, leaf } = props;
  log.render('RichText Leaf', {attributes, children, leaf});
  let ch = children;
  if (leaf.bold) {
    ch = <strong>
      {ch}
    </strong>;
  }

  if (leaf.code) {
    ch = <code>
      {ch}
    </code>;
  }

  if (leaf.italic) {
    ch = <em>
      {ch}
    </em>;
  }

  if (leaf.underline) {
    ch = <u>
      {ch}
    </u>;
  }

  return <span {...attributes}>
    {ch}
  </span>;
};

export default Leaf;
