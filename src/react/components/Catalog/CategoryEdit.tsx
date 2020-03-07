import * as React from 'react';
import {FormEvent} from 'react';
import Modal from '../Modal';
import {getCatalogUI} from '../../../di-default';
import {Category} from '../../../app-rx/catalog';
import useObservable from '../../hooks/useObservable';

const catalogUI = getCatalogUI();
const handleSubmit = (ev: FormEvent) => {
  ev.preventDefault();
  // noinspection JSIgnoredPromiseFromCall
  catalogUI.commitEditCategory();
  return null;
};

const handleClose = () => catalogUI.cancelEditCategory();

const CategoryEdit: React.FunctionComponent<{ category: Category }> = ({category: categoryEdit}): React.ReactElement => {

  const category = useObservable(categoryEdit.observable(), categoryEdit);
  const titleRef = React.useRef<HTMLInputElement>(null);

  React.useEffect((): void => {
    titleRef.current.focus();
    titleRef.current.select();
  }, []);

  return <Modal closeOnEnter={true} onClose={handleClose} >
    <form onSubmit={handleSubmit} >
      <h2 >
        TODO: Level1
      </h2 >
      <h3 >
        {category.id}
      </h3 >
      <div className="field-row" >
        <label htmlFor="title" >
          TODO: Title
        </label >
        <input
          name="title"
          onChange={(ev): void => {
            category.title = ev.target.value
          }}
          ref={titleRef}
          value={category.title} />
      </div >
      <div className="field-row" >
        <label htmlFor="description" >
          TODO: Description
        </label >
        <textarea rows={10}
                  name="description"
                  onChange={(ev): void => {
                    category.description = ev.target.value
                  }}
                  value={category.description} />
      </div >
      <div className="buttons-row" >
        <button onClick={handleClose} >
          TODO: Close
        </button >
      </div >
    </form >
  </Modal >;
};

/*

 */

export default CategoryEdit;
