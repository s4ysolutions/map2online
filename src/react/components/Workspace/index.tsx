import './styles.scss';
import * as React from 'react';
import log from '../../../log';
import useComponentSize from '../../hooks/useComponentSize';
import TopNavigation from './TopNavigation';
import OlMap from '../Ol/OlMap';
import FloatPanel from './FloatPanel';
import LeftDrawer from './LeftDrawer';
import RightDrawer from './RightDrawer';
import {getImportUI} from '../../../di-default';
import useObservable from '../../hooks/useObservable';
import Import from '../Import';
import GoogleMap from '../GoogleMap/GoogleMap';


const importUI = getImportUI();

const Workspace = (): React.ReactElement => {
  log.render('Workspace');
  const ref = React.useRef<Element | null>(null);
  const {height, width} = useComponentSize(ref);
  const importUIVisible = useObservable<boolean>(importUI.visibleObservable(), importUI.visible);

  return <React.Fragment ><TopNavigation key="topNavigation" />
    <div className="workspace" key="workspace" ref={ref as any} >
      <LeftDrawer />
      <div className="map-container" >
        <GoogleMap />
        <OlMap />
      </div >
      <RightDrawer />
      <FloatPanel parentHeight={height} parentWidth={width} />
    </div >
    {importUIVisible && <Import />}
  </React.Fragment >
};

export default React.memo(Workspace);

