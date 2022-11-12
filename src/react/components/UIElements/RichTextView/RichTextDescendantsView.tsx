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
import log from '../../../../log';
import {RichTextDescendant, RichTextElement, StyledText} from '../../../../richtext';
import ElementView from './ElementView';
import StyledTextView from './StyleTextView';

let key = 0;
const RichTextDescendantsView: React.FunctionComponent<{ descendants: RichTextDescendant[]}> =
  ({descendants}): React.ReactElement => {
    log.render('rich-text-descendants');

    return <React.Fragment>
      {
        descendants.map((descendant, index) =>
          RichTextElement.isElement(descendant)
            ? <ElementView element={descendant} isLast={index === descendants.length - 1} key={key++} />
            : RichTextElement.isStyledText(descendant)
              ? <StyledTextView key={key++} styledText={descendant as StyledText} />
              : <p key={key++}>
                {`Wrong types: ${JSON.stringify(descendant)}`}
              </p>)
      }
    </React.Fragment>;
  };

export default RichTextDescendantsView;
