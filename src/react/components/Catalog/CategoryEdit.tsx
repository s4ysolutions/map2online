import * as React from 'react';
import {FormEvent} from 'react';
import Modal from '../Modal';
import {getCatalogUI, getWording} from '../../../di-default';
import {Category} from '../../../app-rx/catalog';
import useObservable from '../../hooks/useObservable';
import T from '../../../l10n';
import {map} from 'rxjs/operators';

const wording = getWording()
const catalogUI = getCatalogUI();
const handleSubmit: (ev: FormEvent) => void = (ev: FormEvent) => {
  ev.preventDefault();
  // noinspection JSIgnoredPromiseFromCall
  catalogUI.commitEditCategory();
  return null;
};

const handleClose = () => catalogUI.cancelEditCategory();

const CategoryEdit: React.FunctionComponent<{ category: Category }> = ({category: categoryEdit}): React.ReactElement => {

  const category = useObservable(
    categoryEdit.observable()
      .pipe(
        map(category => ({title: category.title, description: category.description}))
      ),
    categoryEdit);
  const titleRef = React.useRef<HTMLInputElement>(null);

  React.useEffect((): void => {
    titleRef.current.focus();
    titleRef.current.select();
  }, []);

  return <Modal closeOnEnter={true} onClose={handleClose} className="edit-dialog" >
    <form onSubmit={handleSubmit} >
      <h2 >
        {wording.C('Modify category')}
      </h2 >
      <div className="field-row" >
        <label htmlFor="title" >
          {T`Title`}
        </label >
        <input
          name="title"
          onChange={(ev): void => {
            categoryEdit.title = ev.target.value
          }}
          ref={titleRef}
          value={category.title} />
      </div >
      <div className="field-row" >
        <label htmlFor="description" >
          {T`Description`}
        </label >
        <textarea rows={10}
                  name="description"
                  onChange={(ev): void => {
                    categoryEdit.description = ev.target.value
                  }}
                  value={category.description} />
      </div >
      <div className="buttons-row" >
        <button onClick={handleClose} >
          {T`Close`}
        </button >
      </div >
    </form >
  </Modal >;
};

export default CategoryEdit;
