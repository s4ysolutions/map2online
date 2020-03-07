import * as React from 'react';
import Modal from '../Modal';
import {getCatalogUI} from '../../../di-default';
import {FeatureProps} from '../../../app-rx/catalog';

const catalogUI = getCatalogUI();
const handleSubmit = () => catalogUI.commitEditFeature();
const handleClose = () => catalogUI.cancelEditFeature();

const FeatureEdit: React.FunctionComponent<{ feature: FeatureProps }> = ({feature}): React.ReactElement => {


  const titleRef = React.useRef<HTMLInputElement>(null);

  React.useEffect((): void => {
    titleRef.current.focus();
    titleRef.current.select();
  }, []);

  return <Modal onClose={handleClose} >
    <form onSubmit={handleSubmit} >
      <h2 >
        TODO: Level1
      </h2 >
      <div className="field-row" >
        <label htmlFor="title" >
          TODO: Title
        </label >
        <input
          name="title"
          onChange={(ev): void => {
            feature.title = ev.target.value
          }}
          ref={titleRef}
          value={feature.title} />
      </div >
      <div className="field-row" >
        <label htmlFor="description" >
          TODO: Description
        </label >
        <input
          name="description"
          onChange={(ev): void => {
            feature.description = ev.target.value
          }}
          value={feature.description} />
      </div >
      <div className="buttons-row" >
        <button type="submit" >
          TODO: Submit
        </button >
      </div >
    </form >
  </Modal >;
};

export default FeatureEdit;
