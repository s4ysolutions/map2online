import * as React from 'react';
import Modal from '../Modal';
import {getCatalogUI} from '../../../di-default';
import {RouteProps} from '../../../app-rx/catalog';

const catalogUI = getCatalogUI();
const handleSubmit = () => catalogUI.commitEditRoute();
const handleClose = () => catalogUI.cancelEditRoute();

const RouteEdit: React.FunctionComponent<{ route: RouteProps }> = ({route}): React.ReactElement => {


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
        <button type="submit" >
          TODO: Submit
        </button >
      </div >
    </form >
  </Modal >;
};

export default RouteEdit;
