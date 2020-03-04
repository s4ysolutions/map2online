import * as React from 'react';

interface Props {
  onClick: React.MouseEventHandler;
}

const MenuItem: React.FunctionComponent<Props> =
  ({onClick: handleClick, ...props}): React.ReactElement =>
    <div className="menu-item" onClick={handleClick} {...props} />;

export default MenuItem;
