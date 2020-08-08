import {getWording, getWorkspace} from '../../../di-default';
import * as React from 'react';
import Modal from '../Modal';
import T from '../../../l10n';
import useObservable from '../../hooks/useObservable';

const wording = getWording()
const workspace = getWorkspace()

const Wording = (): React.ReactElement => {
  const categoryVariant = useObservable(wording.observableCurrentCategoryVariant(), wording.currentCategoryVariant)
  const routeVariant = useObservable(wording.observableCurrentRouteVariant(), wording.currentRouteVariant)

  return <Modal className="form" onClose={() => 0} >
    <form >
      <h2 >{T`Personalize wording`}</h2 >
      <h3 >{T`Choose best category`}</h3 >
      <div className="field-row" >
        {wording.categoryVariants.map(category =>
          <div key={category} className="radio-row" >
            <label >
              <input type="radio"
                     id={category}
                     name="categoryVariant"
                     value={category}
                     checked={category === categoryVariant}
                     onChange={() => wording.currentCategoryVariant = category}
              />
              &nbsp;{category}
            </label >
          </div >
        )}
      </div >
      <h4 >{T`Choose best route`}</h4 >
      <div className="field-row" >
        {wording.routeVariants.map(route =>
          <div key={route} className="radio-row" >
            <label >
              <input
                type="radio"
                id={route}
                name="routeVariant"
                value={route}
                checked={route === routeVariant}
                onChange={() => wording.currentRouteVariant = route}
              />
              &nbsp;{route}
            </label >
          </div >
        )}
      </div >
      {categoryVariant && routeVariant &&
      <div className="buttons-row" >
        <button onClick={workspace.togglePersonalization} >
          {T`Close`}
        </button >
      </div >
      }
    </form >
  </Modal >
}

export default React.memo(Wording)
