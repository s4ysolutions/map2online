import * as React from 'react';
import {FormEvent} from 'react';
import Modal from '../Modal';
import {getCatalogUI} from '../../../di-default';
import {Feature} from '../../../app-rx/catalog';
import useObservable from '../../hooks/useObservable';
import T from '../../../l10n';

const catalogUI = getCatalogUI();
const handleSubmit = (ev: FormEvent) => {
  ev.preventDefault();
  catalogUI.commitEditFeature();
  return null;
};

const handleClose = () => catalogUI.cancelEditFeature();

const FeatureEdit: React.FunctionComponent<{ feature: Feature }> = ({feature: featureEdit}): React.ReactElement => {

  const feature = useObservable(featureEdit.observable(), featureEdit);
  const titleRef = React.useRef<HTMLInputElement>(null);

  React.useEffect((): void => {
    titleRef.current.focus();
    titleRef.current.select();
  }, []);

  return <Modal onClose={handleClose} closeOnEnter={true} >
    <form onSubmit={handleSubmit} >
      <h2 >
        {T`Modify Feature`}
      </h2 >
      <div className="field-row" >
        <label htmlFor="title" >
          {T`Title`}
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
          {T`Description`}
        </label >
        <input
          name="description"
          onChange={(ev): void => {
            feature.description = ev.target.value
          }}
          value={feature.description} />
      </div >
      <div className="buttons-row" >
        <button onClick={handleClose} >
          {T`Close`}
        </button >
      </div >
    </form >
  </Modal >;
};

export default FeatureEdit;
