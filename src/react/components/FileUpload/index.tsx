import React, {useCallback, useEffect} from 'react';
import T from '../../../l10n';
import './styles.scss';

const FileUpload: React.FunctionComponent<{ onUpload: (files: FileList) => void }> = ({onUpload}): React.ReactElement => {
  const inputRef = React.useRef<HTMLInputElement>();
  const dndRef = React.useRef<HTMLDivElement>();
  const [over, setOver] = React.useState(false);

  const handleInput = useCallback((evt) => {
    onUpload(evt.target.files);
  }, []);

  const doInput = useCallback((evt) => {
    inputRef.current.click();
    evt.preventDefault();
  }, [inputRef.current]);

  const handleDragOver = useCallback((evt) => {
    setOver(true);
  }, []);

  const handleDragLeave = useCallback((evt) => {
    setOver(false);
  }, []);

  const handleDrop = useCallback((evt) => {
    onUpload(evt.dataTransfer.files);
  }, []);

  useEffect(() => {
    inputRef.current.addEventListener('change', handleInput, false);
    dndRef.current.addEventListener('dragover', handleDragOver, false);
    dndRef.current.addEventListener('dragleave', handleDragLeave, false);
    dndRef.current.addEventListener('drop', handleDrop, false);
    return () => {
      inputRef.current.removeEventListener('change', handleInput);
      inputRef.current.removeEventListener('dragover', handleDragOver);
      inputRef.current.removeEventListener('dragleave', handleDragLeave);
      inputRef.current.removeEventListener('drop', handleDrop);
    }
  }, []);

  return <div >
    <input ref={inputRef} className="file-upload" type="file" name="files[]" multiple />
    <button onClick={doInput} >{T`Upload`}</button >
    <div ref={dndRef} className={"drop-zone" + (over ? ' over' : '')} >{T`Drop files here`}</div >
  </div >
};

export default FileUpload;