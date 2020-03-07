import * as React from 'react';
import Delete from '../Svg/Delete';
import Edit from '../Svg/Edit2';
import Empty from '../Svg/Empty';
import Hidden from '../Svg/Hidden';
import Prefs from '../Svg/Prefs';
import Visible from '../Svg/Visible';
import {Category} from '../../../app-rx/catalog';
import {getCatalogUI} from '../../../di-default';
import useObservable from '../../hooks/useObservable';
import {map} from 'rxjs/operators';
import log from '../../../log';

interface Props {
  canDelete: boolean;
  category: Category;
}

const noOp = (): null => null;
const catalogUI = getCatalogUI();

const CategoryView: React.FunctionComponent<Props> = ({canDelete, category: categoryView}): React.ReactElement => {

  const category = useObservable(categoryView.observable(), categoryView);
  log.render('CategoryView', {category, categoryView});

  const isActive: boolean = useObservable(
    catalogUI.activeCategoryObservable().pipe(map(active => active && active.id === category.id)),
    catalogUI.activeCategory && catalogUI.activeCategory.id === category.id
  );
  const isVisible = useObservable(catalogUI.visibleObservable(category.id), catalogUI.isVisible(category.id));

  const handleDelete = React.useCallback(
    () => {
      catalogUI.requestDeleteCategory(categoryView)
    },
    [categoryView]
  );
  const handleActive = React.useCallback(
    () => {
      if (!isActive && category.routes.length > 0) {
        catalogUI.activeRoute = category.routes[0];
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
    >
      {canDelete ? <Delete /> : <Empty />}
    </div >
    <div className="title" key="title" onClick={handleSelect} >
      {category.title}
    </div >
    <div className="edit" key="edit" onClick={handleEdit} >
      <Prefs />
    </div >
    <div className="active" key="active" onClick={handleActive} >
      <Edit />
    </div >
    <div className="visibility" key="visibility" onClick={handleVisible} >
      {isVisible ? <Visible /> : <Hidden />}
    </div >
  </div >;
};

export default CategoryView;
