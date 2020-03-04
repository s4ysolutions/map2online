import * as React from 'react';
import {getWorkspace} from '../../../../di-default';
import useObservable from '../../../hooks/useObservable';
import log from '../../../../log';

const workspace = getWorkspace();
const AppButton = (): React.ReactElement => {
  log.render('AppButton');
  const show = useObservable(workspace.catalogObservable(), workspace.catalogOpen, 'AppButton');
  return <button className="app-button" onClick={workspace.toggleCatalog} >
    {show ? (
      <svg viewBox="0 0 512 512" >
        <path
          d="m75.858 221.99-59.091 288.9c-0.12883 0.56809 0.3039 1.1087 0.88638 1.1087h435.01l59.341-290.01z"
          opacity=".3"
          strokeWidth="2.0645"
        />
        <polygon
          opacity=".3"
          points="164.58 216.2 355.26 216.2 355.26 187.73 245.96 187.73 218.82 161.32 144 161.32 144 316.83"
          transform="matrix(2.0645 0 0 2.0645 -280.77 -245.01)"
        />
        <path
          d="m59.341 205.47-59.091 288.9c-0.12883 0.56809 0.3039 1.1087 0.88638 1.1087h435.01l59.341-290.01z"
          fill="#fff"
          strokeWidth="2.0645"
        />
        <polygon
          fill="#fff"
          points="156.58 208.2 347.26 208.2 347.26 179.73 237.96 179.73 210.82 153.32 136 153.32 136 308.83"
          transform="matrix(2.0645 0 0 2.0645 -280.77 -245.01)"
        />
      </svg >
    ) : (
      <svg viewBox="0 0 512 512" >
        <polygon
          opacity=".3"
          points="384 210.44 384 176.36 259.84 176.36 229 144 144 144 144 210.44"
          transform="matrix(1.8252 0 0 1.7761 -248.23 -170.04)"
        />
        <path
          d="m14.602 365.92v146.08h438.06v-290.5h-438.06zm136.9-13.668h164.26v17.761h-164.26z"
          opacity=".3"
          strokeWidth="1.8005"
        />
        <polygon
          fill="#fff"
          points="376 202.44 376 168.36 251.84 168.36 221 136 136 136 136 202.44"
          transform="matrix(1.8252 0 0 1.7761 -248.23 -170.04)"
        />
        <path
          d="m0 351.71v146.08h438.06v-290.5h-438.06z"
          fill="#fff"
          strokeWidth="1.8005"
        />
      </svg >
    )}
  </button >;
};

export default AppButton;
