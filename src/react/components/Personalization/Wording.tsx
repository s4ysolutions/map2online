import {getWording, getWorkspace} from '../../../di-default';
import * as React from 'react';
import Modal from '../Modal';
import T from '../../../l10n';
import useObservable from '../../hooks/useObservable';
import {FormEvent} from 'react';

const wording = getWording();
const workspace = getWorkspace();

const handleSubmit: (ev: FormEvent) => void = (ev: FormEvent) => {
  ev.preventDefault();
  // noinspection JSIgnoredPromiseFromCall
  workspace.togglePersonalization();
  return null;
};

const Wording = (): React.ReactElement => {
  const categoryVariant = useObservable(wording.observableCurrentCategoryVariant(), wording.currentCategoryVariant);
  const routeVariant = useObservable(wording.observableCurrentRouteVariant(), wording.currentRouteVariant);

  return <Modal className="form" onClose={() => 0} >
    <form onSubmit={handleSubmit} >
      <h2 >
        {T`Personalize wording`}
      </h2 >
      <h3 >
        {T`Choose best category`}
      </h3 >
      <div className="field-row" >
        {wording.categoryVariants.map(category =>
          <div className="radio-row" key={category} >
            <label >
              <input
                checked={category === categoryVariant}
                id={category}
                name="categoryVariant"
                onChange={() => {
                  wording.currentCategoryVariant = category;
                }}
                type="radio"
                value={category}
              />
              &nbsp;
              {category}
            </label >
          </div >)}
      </div >
      <h4 >
        {T`Choose best route`}
      </h4 >
      <div className="field-row" >
        {wording.routeVariants.map(route =>
          <div className="radio-row" key={route} >
            <label >
              <input
                checked={route === routeVariant}
                id={route}
                name="routeVariant"
                onChange={() => {
                  wording.currentRouteVariant = route;
                }}
                type="radio"
                value={route}
              />
              &nbsp;
              {route}
            </label >
          </div >)}
      </div >
      {categoryVariant && routeVariant &&
      <div className="buttons-row" >
        <button onClick={workspace.togglePersonalization} type="button">
          {T`Close`}
        </button >
      </div >}
    </form >
  </Modal >;
};

export default React.memo(Wording);
