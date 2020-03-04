import './styles.scss';
import * as React from 'react';
import Workspace from './Workspace';
import {hot} from 'react-hot-loader';

const App: React.FunctionComponent = (): React.ReactElement => <div className="application" >
  <Workspace />
</div >;

export default hot(module)(App);
