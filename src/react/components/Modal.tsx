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

const root = document.createElement('div');
document.body.appendChild(root);

const KEY_ESC = 0x0001;
const KEY_ENTER = 0x001C;

const stopPropagation = (ev: React.MouseEvent<HTMLDivElement>): void => ev && ev.stopPropagation && ev.stopPropagation();

const Modal: React.FunctionComponent<{ onClose: () => void, closeOnEnter?: boolean, className?: string }> =
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
        tabIndex={0}
      >
        <div className={`modal-content ${className || ''}`} onClick={stopPropagation} >
          {children}
        </div >
      </div >,
      root,
    );
  };
/*
 *class Modal extends React.PureComponent {
 *  constructor (props) {
 *    super(props);
 *    this.handleKeyPress = this.handleKeyPress.bind(this);
 *    this.setRef = this.setRef.bind(this);
 *  }
 *
 *  componentDidMount () {
 *    if (this.ref) {
 *      this.ref.focus();
 *    }
 *  }
 *
 *  handleKeyPress (ev) {
 *    if (ev.key === 'Escape' || ev.keyCode === KEY_ESC) {
 *      this.props.onClose();
 *    }
 *  }
 *
 *  setRef (el) {
 *    this.ref = el;
 *  }
 *
 *  render () {
 *    return (
 *      this.props.show &&
 *      ReactDOM.createPortal(
 *        <div
 *          className="modal"
 *          onClick={this.props.onClose}
 *          onKeyPress={this.handleKeyPress}
 *          ref={this.setRef}
 *          tabIndex="0"
 *        >
 *          <div className="modal-content" onClick={stopPropagation}>
 *            {this.props.children}
 *          </div>
 *        </div>,
 *        root
 *      )
 *    );
 *  }
 *}
 *
 *Modal.propTypes = {
 *  children: PropTypes.any,
 *  onClose: PropTypes.func.isRequired,
 *  show: PropTypes.bool.isRequired,
 *};
 */

export default Modal;
