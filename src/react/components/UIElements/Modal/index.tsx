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
import ReactDOM from 'react-dom';
import {ReactNode} from 'react';

const root = document.createElement('div');
document.body.appendChild(root);

const KEY_ESC = 0x0001;
const KEY_ENTER = 0x001C;

const stopPropagation = (ev: React.MouseEvent<HTMLDivElement>): void => ev && ev.stopPropagation && ev.stopPropagation();

const Modal: React.FunctionComponent<{ onClose: () => void, closeOnEnter?: boolean, className?: string, children: ReactNode[] | ReactNode }> =
  ({onClose: handleClose, children, className, closeOnEnter}): React.ReactElement => {
    const handleKeyPress: React.KeyboardEventHandler = (ev: React.KeyboardEvent): void => {
      if (ev.key === 'Escape' || ev.keyCode === KEY_ESC) {
        handleClose();
      } else {
        const {target} = ev;
        const textArea = target && (target as unknown as { tagName: string }).tagName === 'TEXTAREA';
        // eslint-disable-next-line no-unused-vars
        const richEditor = target && (target as unknown as { hasAttribute: (name: string) => boolean}).hasAttribute('data-slate-editor');
        if (closeOnEnter && (ev.key === 'Enter' || ev.keyCode === KEY_ENTER) && !textArea && !richEditor) {
          handleClose();
        }
      }
    };

    return ReactDOM.createPortal(
      <div
        className="modal"
        onClick={handleClose}
        onKeyDown={handleKeyPress}
      >
        <div className={`modal-content ${className || ''}`} onClick={stopPropagation} >
          {children}
        </div >
      </div >,
      root,
    );
  };

export default Modal;
