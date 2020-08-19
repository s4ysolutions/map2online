import * as React from 'react';
import Delete from '../Svg/Delete';
import Edit from '../Svg/Edit2';
import Empty from '../Svg/Empty';
import Hidden from '../Svg/Hidden';
import Prefs from '../Svg/Prefs';
import Visible from '../Svg/Visible';
import {Category} from '../../../app-rx/catalog';
import {getCatalog, getCatalogUI, getWording} from '../../../di-default';
import useObservable from '../../hooks/useObservable';
import {filter, map} from 'rxjs/operators';
import log from '../../../log';
import {skipConfirmDialog} from '../../../lib/confirmation';

interface Props {
  canDelete: boolean;
  category: Category;
}

const noOp = (): null => null;
const catalog = getCatalog();
const catalogUI = getCatalogUI();
const wording = getWording();

const CategoryView: React.FunctionComponent<Props> = ({canDelete, category: categoryView}): React.ReactElement => {

  const category = useObservable(
    categoryView.observable().pipe(
      filter(v => !!v) // don't rerender on deleteted category
    ),
    categoryView
  )

  const isActive: boolean = useObservable(
    catalogUI.activeCategoryObservable().pipe(map(active => active && active.id === category.id)),
    catalogUI.activeCategory && catalogUI.activeCategory.id === category.id
  );
  const isVisible = useObservable(catalogUI.visibleObservable(category.id), catalogUI.isVisible(category.id));

  log.render('CategoryView', {title: category.title, canDelete, category, categoryView, isVisible});

  const handleDelete = React.useCallback(
    () => {
      if (skipConfirmDialog()) {
        catalog.categories.remove(category)
      } else {
        catalogUI.requestDeleteCategory(categoryView)
      }
    },
    [category, categoryView]
  );

  const handleActive = React.useCallback(
    () => {
      if (!isActive && category.routes.length > 0) {
        catalogUI.activeRoute = category.routes.byPos(0);
      }
    },
    [isActive, category.routes.length, catalogUI.activeRoute]
  );

  const handleSelect = React.useCallback(() => {
    catalogUI.selectedCategory = category;
    handleActive()
  }, [category.id, catalogUI.selectedCategory]);
  const handleVisible = React.useCallback(() => catalogUI.setVisible(category.id, !isVisible), [isVisible]);
  const handleEdit = React.useCallback(() => catalogUI.startEditCategory(category), [category]);

  return <div className={isActive ? 'item current' : 'item'} >
    <div
      className="delete"
      key="delete"
      onClick={canDelete ? handleDelete : noOp}
      title={wording.C('Delete category hint')}
    >
      {canDelete ? <Delete /> : <Empty />}
    </div >
    <div className="title"
         key="title"
         onClick={handleSelect}
         title={wording.R('Open category hint')}
    >
      {category.title + (categoryView.routes.length > 0 && ` (${categoryView.routes.length})` || '0')}
    </div >
    <div
      className="edit"
      key="edit"
      onClick={handleEdit}
      title={wording.C('Modifiy category hint')}
    >
      <Prefs />
    </div >
    <div
      className="active"
      key="active"
      onClick={handleActive}
      title={wording.C('Activate category hint')}
    >
      <Edit />
    </div >
    <div
      className="visibility"
      key="visibility"
      onClick={handleVisible}
      title={wording.C('Visibility category hint')}
    >
      {isVisible ? <Visible /> : <Hidden />}
    </div >
  </div >;
};

export default CategoryView;
