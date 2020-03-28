import * as React from 'react';
import * as ReactDOM from 'react-dom';

import 'normalize.css';
import 'styles.scss';
import 'form.scss';
import 'theme-quick-minimal.scss';

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
  document.getElementById('reactMount')
);