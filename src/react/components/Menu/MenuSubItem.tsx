import * as React from 'react';

interface Props {
  onClick: React.MouseEventHandler;
}

const MenuSubItem: React.FunctionComponent<Props> =
  ({onClick: handleClick, children}): React.ReactElement => <div className="sub-menu" onClick={handleClick} >
    {children}
  </div >;

export default MenuSubItem;
