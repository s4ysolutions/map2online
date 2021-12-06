import * as React from 'react';
import {useEffect, useState} from 'react';
import T from '../../l10n';
import {getCatalog, initDI} from '../../di-default';
import App from './App';
import {hot} from 'react-hot-loader';
import log from '../../log';

const WaitInitialization: React.FunctionComponent = (): React.ReactElement => {

  const [initDone, setInitDone] = useState(false);

  useEffect(() => {
    initDI().then(() => {
      log.debug('Init DI done', getCatalog());
      setInitDone(true);
    });
  }, []);

  log.render(`WaitInitialization done=${initDone}`);

  return initDone && <App /> || <div >
    {T`Loading...`}
  </div >;
};

export default hot(module)(WaitInitialization);
