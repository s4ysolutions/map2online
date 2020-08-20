import * as React from 'react';
import {FormEvent} from 'react';
import Modal from '../Modal';
import {getCatalogUI, getWording} from '../../../di-default';
import {Route} from '../../../app-rx/catalog';
import useObservable from '../../hooks/useObservable';
import T from '../../../l10n';
import log from '../../../log';
import {map} from 'rxjs/operators';

const catalogUI = getCatalogUI();
const wording = getWording();

const handleSubmit: (ev: FormEvent) => void = (ev: FormEvent) => {
  ev.preventDefault();
  catalogUI.commitEditRoute().then(r => r);
  return null;
};

const handleClose = () => catalogUI.cancelEditRoute();

const RouteEdit: React.FunctionComponent<{ route: Route }> = ({route: routeEdit}): React.ReactElement => {

  const route = useObservable(
    routeEdit
      .observable()
      .pipe(map(r => ({title: r.title, description: r.description})))
    , routeEdit,
  );

  log.render('RouteEdit debug', {route, routeEdit});

  const titleRef = React.useRef<HTMLInputElement>(null);

  React.useEffect((): void => {
    titleRef.current.focus();
    titleRef.current.select();
  }, []);

  return <Modal className="edit-dialog" closeOnEnter onClose={handleClose} >
    <form onSubmit={handleSubmit} >
      <h2 >
        {wording.R('Modify route')}
      </h2 >
      <div className="field-row" >
        <label htmlFor="title" >
          {T`Title`}
        </label >
        <input
          name="title"
          onChange={(ev): void => {
            routeEdit.title = ev.target.value;
          }}
          ref={titleRef}
          value={route.title} />
      </div >
      <div className="field-row" >
        <label htmlFor="description" >
          {T`Description`}
        </label >
        <textarea
          name="description"
          onChange={(ev): void => {
            routeEdit.description = ev.target.value;
          }}
          rows={10}
          value={route.description} />
      </div >
      <div className="buttons-row" >
        <button onClick={handleClose} type="button">
          {T`Close`}
        </button >
      </div >
    </form >
  </Modal >;
};

export default RouteEdit;
