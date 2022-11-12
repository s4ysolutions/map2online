/*
 * Copyright 2022 s4y.solutions
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 * limitations under the License.
 */

import Modal from '../../UIElements/Modal';
import React from 'react';
import T from '../../../../l10n';
import {startSkipConfirmTimer} from '../../../../lib/confirmation';

interface Props {
  onConfirm: () => void;
  onCancel: () => void;
  title: string,
  message: string,
  confirm?: string,
}


const ConfirmDialog: React.FunctionComponent<Props> = ({confirm, onCancel: handleCancel, onConfirm: handleConfirm, message, title}): React.ReactElement => {
  const [skip, setSkip] = React.useState(false);
  return <Modal onClose={handleCancel} >
    <h2 className="confirm-dialog-title" >
      {title}
    </h2 >

    <div className="confirm-dialog-message" >
      {message}
    </div >

    <div className="buttons-row" >
      <button onClick={handleCancel} type="button" >
        {T`Cancel`}
      </button >

      <button
        onClick={() => {
          handleConfirm();
          if (skip) {
            startSkipConfirmTimer();
          }
        }}
        type="button" >
        {confirm || T`Confirm`}
      </button >
    </div >

    <div className="buttons-row" >
      <label htmlFor="set_skip_checkbox" >
        <input
          checked={skip}
          id="set_skip_checkbox"
          onChange={() => {
            setSkip(!skip);
          }}
          type="checkbox" />
        &nbsp;
        {T`Skip this dialog`}
      </label >
    </div >
  </Modal >;
};

export default ConfirmDialog;
