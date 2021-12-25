/*
 * Copyright 2019 s4y.solutions
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

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import 'reset-css';
import 'normalize.css';
import 'styles.scss';
import 'modal.scss';
import 'form.scss';
import 'typo.scss';
import 'theme-yellow-black.scss';

import amplitude from 'amplitude-js';

import './extensions/array+serializePlainText';
import './extensions/array+serializeRichText';
import './extensions/string+richtext';
import './extensions/string+format';

import WaitInitialization from './react/components/WaitInitialization';

window.addEventListener('dragover', (e) => {
  // e = e || event;
  e.preventDefault();
}, false);
window.addEventListener('drop', (e) => {
  // e = e || event;
  e.preventDefault();
}, false);

amplitude.getInstance().init('c742fb5cda6af23078ebe5655712b658');
amplitude.getInstance().logEvent('visit');

ReactDOM.render(
  <WaitInitialization />,
  document.getElementById('reactMount'),
);
