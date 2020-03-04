import * as React from 'react';

const MenuButton = (props: { title: string, onClick: React.MouseEventHandler }) =>
  <button className="menu-item" type="button" onClick={props.onClick} >
    {props.title}
  </button >
;

export default MenuButton;
