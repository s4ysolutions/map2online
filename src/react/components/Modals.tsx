/*
 * Copyright 2022 s4y.solutions
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as React from 'react';
import T from '../../l10n';
import {getCatalog, getCatalogUI, getImportUI, getWording, getWorkspace} from '../../di-default';
import useObservable from '../hooks/useObservable';
import ConfirmDialog from './ModalForms/ConfirmDialog';
import {setSpinnerActive} from './UIElements/Spinner/hooks/useSpinner';
import {isPoint} from '../../catalog';
import Import from './ModalForms/Import';
import About from './ModalForms/About';
import Wording from './ModalForms/Personalization/Wording';
import CategoryEdit from './ModalForms/CategoryEdit';
import RouteEdit from './ModalForms/RouteEdit';
import FeatureEdit from './ModalForms/FeatureEdit';


const catalogUI = getCatalogUI();
const catalog = getCatalog();
const wording = getWording();
const importUI = getImportUI();
const workspace = getWorkspace();

const Modals: React.FunctionComponent = (): React.ReactElement => {
  const categoryEdit = useObservable(catalogUI.categoryEditObservable(), catalogUI.categoryEdit);
  const categoryDelete = useObservable(catalogUI.categoryDeleteObservable(), catalogUI.categoryDelete);

  const routeEdit = useObservable(catalogUI.routeEditObservable(), catalogUI.routeEdit);
  const routeDelete = useObservable(catalogUI.routeDeleteObservable(), catalogUI.routeDelete);

  const featureEdit = useObservable(catalogUI.featureEditObservable(), catalogUI.featureEdit);
  const featureDelete = useObservable(catalogUI.featureDeleteObservable(), catalogUI.featureDelete);

  const visibleObservable = importUI.visibleObservable();
  const personalizationObservable = workspace.personalizationObservable();
  const aboutObservable = workspace.aboutObservable();
  const importUIVisible = useObservable<boolean>(visibleObservable, importUI.visible);
  const personalizationVisible = useObservable<boolean>(personalizationObservable, workspace.personalizationOpen);
  const aboutVisible = useObservable<boolean>(aboutObservable, workspace.aboutOpen);

  return <React.Fragment>

    {importUIVisible ? <Import /> : null}

    {personalizationVisible ? <Wording /> : null}

    {aboutVisible ? <About /> : null}

    {featureDelete ? <ConfirmDialog
      confirm={T`Yes, delete the feature`}
      message={T`The feature will be deleted, are you sure?`}
      onCancel={catalogUI.endDeleteFeature}
      onConfirm={() => {
        catalogUI.endDeleteFeature();
        setSpinnerActive(true);
        setTimeout(() => {
          const {feature, route} = featureDelete;
          route.features.remove(feature).then(() => {
            setSpinnerActive(false);
          })
            .catch(() => {
              setSpinnerActive(false);
            });
        }, 1);
      }}
      title={isPoint(featureDelete.feature.geometry) ? T`Delete point` : T`Delete line`}
    /> : null}

    {routeDelete ? <ConfirmDialog
      confirm={wording.R('Yes, delete the route')}
      message={wording.R('Delete route warning')}
      onCancel={catalogUI.endDeleteRoute}
      onConfirm={() => {
        catalogUI.endDeleteRoute();
        catalogUI.endDeleteCategory();
        setSpinnerActive(true);
        setTimeout(() => {
          const {category, route} = routeDelete;
          category.routes.remove(route).then(() => {
            setSpinnerActive(false);
          })
            .catch(() => {
              setSpinnerActive(false);
            });
        }, 1);
      }}
      title={wording.R('Delete route')}
    /> : null}

    {categoryDelete ? <ConfirmDialog
      confirm={wording.C('Yes, delete the category')}
      message={wording.CR('Delete category warning')}
      onCancel={catalogUI.endDeleteCategory}
      onConfirm={() => {
        catalogUI.endDeleteCategory();
        setSpinnerActive(true);
        setTimeout(() => {
          catalog.categories.remove(categoryDelete).then(() => {
            setSpinnerActive(false);
          })
            .catch(() => setSpinnerActive(false));
        }, 1);
      }}
      title={wording.C('Delete category')}
    /> : null}

    {categoryEdit ? <CategoryEdit category={categoryEdit} /> : null}

    {routeEdit ? <RouteEdit route={routeEdit} /> : null}

    {featureEdit ? <FeatureEdit feature={featureEdit} /> : null}

  </React.Fragment>;

};

export default Modals;
