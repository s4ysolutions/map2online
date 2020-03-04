import './styles.scss';
import * as React from 'react';
import log from '../../../log';
import useComponentSize from '../../hooks/useComponentSize';
import TopNavigation from './TopNavigation';
import OlMap from '../Ol/OlMap';
import FloatPanel from './FloatPanel';
import LeftDrawer from './LeftDrawer';
import RightDrawer from './RightDrawer';

const Workspace = (): React.ReactElement => {
  log.render('Workspace');
  const ref = React.useRef<Element | null>(null);
  const {height, width} = useComponentSize(ref);

  return <React.Fragment ><TopNavigation key="topNavigation" />
    <div className="workspace" key="workspace" ref={ref as any} >
      <div className="map-container" >
        <OlMap />
      </div >
      <FloatPanel parentHeight={height} parentWidth={width} />
      <LeftDrawer />
      <RightDrawer />
    </div >
  </React.Fragment >
};

export default React.memo(Workspace);

