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

import 'normalize.css';
import 'reset-css';
import 'styles.scss';
import 'form.scss';
import 'theme-yellow-black.scss';

import App from 'react/components/App';

window.addEventListener('dragover', (e) => {
  // e = e || event;
  e.preventDefault();
}, false);
window.addEventListener('drop', (e) => {
  // e = e || event;
  e.preventDefault();
}, false);

ReactDOM.render(
  <App />,
  document.getElementById('reactMount'),
);
