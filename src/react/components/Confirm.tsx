import Modal from './Modal';
import React from 'react';
import T from '../../l10n';
import {startSkipConfirmTimer} from '../../lib/confirmation';

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
