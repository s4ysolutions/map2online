import * as React from 'react';

interface Props {
  on: boolean;
  onClick: () => void;
}

const Tab: React.FunctionComponent<Props> = ({on, children, onClick}): React.ReactElement =>
  <button className={`tab menu-item ${on ? 'on' : 'off'}`} onClick={onClick} type="button" >
    {children}
  </button >
;

export default Tab;
