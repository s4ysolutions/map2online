import React, {useCallback, useEffect} from 'react';
import T from '../../../l10n';
import './styles.scss';

const FileUpload: React.FunctionComponent<{ onUpload: (files: FileList) => void }> = ({onUpload}): React.ReactElement => {
  const inputRef = React.useRef<HTMLInputElement>();
  const dndRef = React.useRef<HTMLDivElement>();
  const [over, setOver] = React.useState(false);

  const handleInput = useCallback((evt) => {
    onUpload(evt.target.files);
  }, [onUpload]);

  const doInput = useCallback((evt) => {
    inputRef.current.click();
    evt.preventDefault();
  }, []);

  const handleDragOver = useCallback(() => {
    setOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setOver(false);
  }, []);

  const handleDrop = useCallback((evt) => {
    onUpload(evt.dataTransfer.files);
  }, [onUpload]);

  useEffect(() => {
    const ir = inputRef.current;
    const dr = dndRef.current;
    ir.addEventListener('change', handleInput, false);
    dr.addEventListener('dragover', handleDragOver, false);
    dr.addEventListener('dragleave', handleDragLeave, false);
    dr.addEventListener('drop', handleDrop, false);
    return () => {
      ir.removeEventListener('change', handleInput);
      dr.removeEventListener('dragover', handleDragOver);
      dr.removeEventListener('dragleave', handleDragLeave);
      dr.removeEventListener('drop', handleDrop);
    };
  }, [handleDragLeave, handleDragOver, handleDrop, handleInput]);

  return <div className="upload-control">
    <input className="file-upload" multiple name="files[]" ref={inputRef} type="file" />
    <button onClick={doInput} type="button">
      {T`Click tp Upload`}
    </button >
    <div className={`drop-zone${over ? ' over' : ''}`} ref={dndRef} >
      {T`or drop files here`}
    </div >
  </div >;
};

export default FileUpload;
