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

import React, {Fragment} from 'react';
import log from '../../../log';
import {StyledText} from '../../../richtext';

const StyledTextView: React.FunctionComponent<{ styledText: StyledText}> =
  ({styledText}): React.ReactElement => {
    log.render('StyledTextView');
    const {text} = styledText;
    return styledText.bold
      ? <b>
        {text}
      </b>
      : styledText.italic
        ? <i>
          {text}
        </i>
        : styledText.underline
          ? <u>
            {text}
          </u>
          : styledText.code
            ? <code>
              {text}
            </code>
            // eslint-disable-next-line react/jsx-no-useless-fragment
            : <Fragment>
              {text}
            </Fragment>;
  };

export default StyledTextView;
