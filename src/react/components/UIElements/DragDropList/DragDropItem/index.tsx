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
import {Draggable, DraggingStyle, NotDraggingStyle} from 'react-beautiful-dnd';

const getDraggingStyle =
  (isDragging: boolean, draggableStyle: DraggingStyle | NotDraggingStyle): DraggingStyle | NotDraggingStyle => ({
    /*
     * some basic styles to make the items look a bit nicer
     * userSelect: 'none',
     */

    /*
     *  padding: grid2,
     * margin: `0 0 ${grid}px 0`,
     */

    /*
     * change background colour if dragging
     * background: isDragging ? 'lightgreen' : 'grey',
     */

    // styles we need to apply on draggables
    ...draggableStyle,
  });

const DragDropItem: React.FunctionComponent<{
  id: string,
  index: number,
  children: React.ReactNode | React.ReactNode[]
}> = ({children, id, index}): React.ReactElement =>
  <Draggable draggableId={id} index={index} >
    {(provided, snapshot): React.ReactElement => <div
      className="draggable item"
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      style={getDraggingStyle(
        snapshot.isDragging,
        provided.draggableProps.style || {},
      )}
    >
      {children}
    </div >}
  </Draggable >;

export default DragDropItem;
