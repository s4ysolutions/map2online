import Modal from './Modal';
import React from 'react';
import T from '../../l10n';

interface Props {
  onConfirm: () => void;
  onCancel: () => void;
  title: string,
  message: string,
  confirm?: string,
}

const ConfirmDialog: React.FunctionComponent<Props> = ({confirm, onCancel: handleCancel, onConfirm: handleConfirm, message, title}): React.ReactElement => {
  return <Modal onClose={handleCancel} >
    <h2 className="confirm-dialog-title" >{title}</h2 >
    <div className="confirm-dialog-message" >
      {message}
    </div >
    <div className="buttons-row" >
      <button onClick={handleCancel} >
        {T`Cancel`}
      </button >
      <button onClick={handleConfirm} >
        {confirm || T`Confirm`}
      </button >
    </div >
  </Modal >
};

export default ConfirmDialog;