/*
 * Copyright 2019 s4y.solutions
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as React from 'react';
import Draggable, {DraggableData} from 'react-draggable';
import Handle from '../../Svg/Handle';
import ToolsPanel from 'react/components/ToolsPanel';
import usePosition from './usePosition';
import useComponentSize from '../../../hooks/useComponentSize';
import {getWorkspace} from '../../../../di-default';
import useObservable from '../../../hooks/useObservable';
import log from '../../../../log';

const workspace = getWorkspace();

interface Props {
  parentHeight: number;
  parentWidth: number;
}

const FloatPanel: React.FunctionComponent<Props> =
  ({parentHeight, parentWidth}): React.ReactElement => {
    const ref = React.useRef<HTMLDivElement | null>(null);
    const {height, width} = useComponentSize(ref);
    const [position, setPosition] = usePosition(width, height, parentWidth, parentHeight);
    const visible = useObservable(workspace.toolsObservable(), workspace.toolsOpen);


    if (parentHeight <= 0 || parentWidth <= 0) {
      log.warn('render Float Panel parent size is zero');
      return null;
    }
    return <Draggable
      bounds="parent"
      handle=".drag-handle"
      onStop={(_: MouseEvent, d: DraggableData): void => setPosition(d.x || 0, d.y || 0)}
      position={position}
    >
      <div
        className={`float-panel ${visible ? 'visible' : 'invisible'}`}
        ref={ref}
      >
        <ToolsPanel />
        <div className="drag-handle" >
          <Handle />
        </div >
      </div >
    </Draggable >;
  };

export default React.memo(FloatPanel);
