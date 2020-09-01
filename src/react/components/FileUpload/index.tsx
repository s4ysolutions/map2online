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
