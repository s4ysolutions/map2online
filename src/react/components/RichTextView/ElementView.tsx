/*
 * Copyright 2022 s4y.solutions
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react';
import log from '../../../log';
import {RichTextElement, RichTextElementType} from '../../../richtext';
import RichTextDescendantsView from './RichTextDescendantsView';

const ElementView: React.FunctionComponent<{ element: RichTextElement, isLast: boolean}> =
  ({element, isLast}): React.ReactElement => {
    log.render('RichTextElementView');
    const {type, children} = element;
    return type === RichTextElementType.BlockQuote
      ? <blockquote >
        <RichTextDescendantsView descendants={children} />
      </blockquote >
      : type === RichTextElementType.BulletedList
        ? <ul >
          <RichTextDescendantsView descendants={children} />
        </ul >
        : type === RichTextElementType.NumberedList
          ? <ol >
            <RichTextDescendantsView descendants={children} />
          </ol >
          : type === RichTextElementType.ListItem
            ? <li >
              <RichTextDescendantsView descendants={children} />
            </li >
            : type === RichTextElementType.HeadingOne
              ? <h1 >
                <RichTextDescendantsView descendants={children} />
              </h1 >
              : type === RichTextElementType.HeadingTwo
                ? <h2 >
                  <RichTextDescendantsView descendants={children} />
                </h2 >
                : type === RichTextElementType.Image
                  ? <img alt="" src={element.url} />
                  : type === RichTextElementType.Link
                    ? <a href={element.url} rel="noreferrer" target="_blank" >
                      <RichTextDescendantsView descendants={children} />
                    </a >
                    : type === RichTextElementType.Paragraph
                      ? isLast && (children.length === 0 || (children.length === 1 && RichTextElement.isStyledText(children[0]) && children[0].text.trim().length === 0))
                      // eslint-disable-next-line react/jsx-no-useless-fragment
                        ? <React.Fragment />
                        : <p >
                          <RichTextDescendantsView descendants={children} />
                        </p >
                      : <div>
                        {`wrong element: ${JSON.stringify(element)}`}
                      </div>;
  };

export default ElementView;
