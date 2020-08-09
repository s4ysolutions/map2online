import * as React from 'react';
import Draggable, {DraggableData} from 'react-draggable';
import Handle from '../../Svg/Handle';
import ToolsPanel from 'react/components/ToolsPanel';
import usePosition from './usePosition';
import useComponentSize from '../../../hooks/useComponentSize';
import {getWorkspace} from '../../../../di-default';
import useObservable from '../../../hooks/useObservable';

const workspace = getWorkspace();

interface Props {
  parentHeight: number;
  parentWidth: number;
}

const FloatPanel: React.FunctionComponent<Props> =
  ({parentHeight, parentWidth}): React.ReactElement => {
    if (parentHeight <= 0 || parentWidth <= 0) {
      return null;
      console.debug('render Float Panel parent size is zero');
    }
    const ref = React.useRef<Element | null>(null);
    const {height, width} = useComponentSize(ref);
    const [position, setPosition] = usePosition(width, height, parentWidth, parentHeight);
    const visible = useObservable(workspace.toolsObservable(), workspace.toolsOpen);
    console.debug(`render Float Panel visible=${visible}`);


    return <Draggable
      bounds="parent"
      handle=".drag-handle"
      onStop={(_: MouseEvent, d: DraggableData): void => setPosition(d.x || 0, d.y || 0)}
      position={position}
    >
      <div
        className={`float-panel ${visible ? 'visible' : 'invisible'}`}
        ref={ref as any}
      >
        <ToolsPanel />
        <div className="drag-handle" >
          <Handle />
        </div >
      </div >
    </Draggable >;
  };

export default React.memo(FloatPanel);