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


import React from 'react';
import {ReactElement} from 'react';
import log from '../../../../log';
import Image, {ImageProps} from './Image';
import {RichTextElement, RichTextElementType} from '../../../../richtext';
import {RenderElementProps} from 'slate-react';
import Link, {LinkProps} from './link';

type ElementProps = RenderElementProps & { element: RichTextElement};
const Element = (props: ElementProps): ReactElement => {
  const { attributes, children, element } = props;
  log.render('RichText Element', {attributes, children, element});
  switch (element.type) {
    case RichTextElementType.BlockQuote:
      // eslint-disable-next-line react/react-in-jsx-scope
      return <blockquote {...attributes}>
        {children}
      </blockquote>;
    case RichTextElementType.BulletedList: //'bulleted-list':
      return <ul {...attributes}>
        {children}
      </ul>;
    case RichTextElementType.HeadingOne: //'heading-one':
      return <h1 {...attributes}>
        {children}
      </h1>;
    case RichTextElementType.HeadingTwo: //'heading-two':
      return <h2 {...attributes}>
        {children}
      </h2>;
    case RichTextElementType.ListItem: //'list-item':
      return <li {...attributes}>
        {children}
      </li>;
    case RichTextElementType.NumberedList: //'numbered-list':
      return <ol {...attributes}>
        {children}
      </ol>;
    case RichTextElementType.Image: { //'image': {
      const imageProps = props as ImageProps;
      return <Image {...imageProps} />;
    }
    case RichTextElementType.Link: { //'link': {
      const linkProps = props as LinkProps;
      return <Link {...linkProps} />;
    }
    case RichTextElementType.Paragraph: {
      return <p {...attributes}>
        {children}
      </p>;
    }
    default:
      log.error(`Unknown RichText element type = ${element.type}`, element);
      return <p {...attributes}>
        {children}
      </p>;
  }
};

export default Element;
