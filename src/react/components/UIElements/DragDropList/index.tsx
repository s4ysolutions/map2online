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
import {DragDropContext, DropResult, Droppable} from 'react-beautiful-dnd';
import {useCallback} from 'react';
import './styles.scss';

const getListClassName = (isDraggingOver: boolean): string => `drag-drop-list  ${isDraggingOver ? ' dragging-over' : ''}`;

const DragDropList: React.FunctionComponent<{
  children: React.ReactNode | React.ReactNode[],
  droppableId: string,
  onDragEnd: (indexS: number, indexD: number | null) => void,
}> =
  ({droppableId, onDragEnd, children}): React.ReactElement => {
    const handleDragEnd = useCallback(
      (result: DropResult): void => {
        const indexS = result.source.index;
        const indexD = result.destination?.index;
        onDragEnd(indexS, indexD === undefined ? null : indexD);
      },
      [onDragEnd],
    );

    return <DragDropContext onDragEnd={handleDragEnd} >
      <Droppable droppableId={droppableId} >
        {(providedDroppable, snapshotDroppable): React.ReactElement => <div
          className={getListClassName(snapshotDroppable.isDraggingOver)}
          ref={providedDroppable.innerRef}
        >
          {children}
        </div >}
      </Droppable >
    </DragDropContext >;
  };

export default DragDropList;

