import Modal from './Modal';
import React from 'react';
import T from '../../l10n';
import Timer = NodeJS.Timer;

interface Props {
  onConfirm: () => void;
  onCancel: () => void;
  title: string,
  message: string,
  confirm?: string,
}

let skipConfirmTimer: Timer | null = null;

const startSkipConfirmTimer = () => {
  skipConfirmTimer = setTimeout(() => {
    skipConfirmTimer = null;
  }, 10000)
}

const ConfirmDialog: React.FunctionComponent<Props> = ({confirm, onCancel: handleCancel, onConfirm: handleConfirm, message, title}): React.ReactElement => {
  if (skipConfirmTimer) {
    clearTimeout(skipConfirmTimer)
    startSkipConfirmTimer()
    setTimeout(handleConfirm, 0)
    return null;
  }
  const [skip, setSkip] = React.useState(false)
  return <Modal onClose={handleCancel} >
    <h2 className="confirm-dialog-title" >{title}</h2 >
    <div className="confirm-dialog-message" >
      {message}
    </div >
    <div className="buttons-row" >
      <button onClick={handleCancel} >
        {T`Cancel`}
      </button >
      <button onClick={() => {
        handleConfirm()
        if (skip) {
          startSkipConfirmTimer()
        }
      }} >
        {confirm || T`Confirm`}
      </button >
    </div >
    <div className="buttons-row" >
      <label htmlFor="set_skip_checkbox" >
        <input id="set_skip_checkbox" type="checkbox" checked={skip} onChange={ev => {
          setSkip(!skip)
        }} />&nbsp;
        {T`Skip this dialog`}
      </label >
    </div >
  </Modal >
};

export default ConfirmDialog;