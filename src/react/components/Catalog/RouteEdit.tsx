import * as React from 'react';
import {FormEvent} from 'react';
import Modal from '../Modal';
import {getCatalogUI, getWording} from '../../../di-default';
import {Route} from '../../../app-rx/catalog';
import useObservable from '../../hooks/useObservable';

const catalogUI = getCatalogUI();
const wording = getWording();

const handleSubmit = (ev: FormEvent) => {
  ev.preventDefault();
  catalogUI.commitEditRoute();
  return null;
};

const handleClose = () => catalogUI.cancelEditRoute();

const RouteEdit: React.FunctionComponent<{ route: Route }> = ({route: routeEdit}): React.ReactElement => {

  const route = useObservable(routeEdit.observable(), routeEdit);
  const titleRef = React.useRef<HTMLInputElement>(null);

  React.useEffect((): void => {
    titleRef.current.focus();
    titleRef.current.select();
  }, []);

  return <Modal onClose={handleClose} closeOnEnter={true} >
    <form onSubmit={handleSubmit} >
      <h2 >
        {wording.R('Modify route')}
      </h2 >
      <div className="field-row" >
        <label htmlFor="title" >
          TODO: Title
        </label >
        <input
          name="title"
          onChange={(ev): void => {
            route.title = ev.target.value
          }}
          ref={titleRef}
          value={route.title} />
      </div >
      <div className="field-row" >
        <label htmlFor="description" >
          TODO: Description
        </label >
        <input
          name="description"
          onChange={(ev): void => {
            route.description = ev.target.value
          }}
          value={route.description} />
      </div >
      <div className="buttons-row" >
        <button onClick={handleClose} >
          TODO: Close
        </button >
      </div >
    </form >
  </Modal >;
};

export default RouteEdit;
