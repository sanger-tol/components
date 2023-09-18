/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import DnDColumn from "./Column"
import { DragDropContext, DropResult } from "react-beautiful-dnd";

export interface Props {
  leftList: string[],
  rightList: string[]
}

function CompareDnD(props: Props) {
  const { leftList, rightList } = props;
  const initialColumns = {
    left: {
      id: 'left',
      list: leftList
    },
    right: {
      id: 'right',
      list: rightList
    }
  }
  const [columns, setColumns] = useState(initialColumns)
  console.log(columns)

  const onDragEnd = ({ source, destination }: DropResult) => {
    // make sure we have a valid destination
    if (destination === undefined || destination === null) return null

    // make sure we're actually moving the item
    if (
      source.droppableId === destination.droppableId &&
      destination.index === source.index
    )
      return null

    // set start and end variables
    const start = columns[source.droppableId]
    const end = columns[destination.droppableId]

    // if start is the same as end, we're in the same column
    if (start === end) {
      // move the item within the list
      // start by making a new list without the dragged item
      const newList = start.list.filter(
        (_: any, idx: number) => idx !== source.index
      )

      // then insert the item at the right location
      newList.splice(destination.index, 0, start.list[source.index])

      // then create a new copy of the column object
      const newCol = {
        id: start.id,
        list: newList
      }

      // update the state
      setColumns(state => ({ ...state, [newCol.id]: newCol }))
      return null
    } else {
      // ff start is different from end, we need to update multiple columns
      // filter the start list like before
      const newStartList = start.list.filter(
        (_: any, idx: number) => idx !== source.index
      )

      // create a new start column
      const newStartCol = {
        id: start.id,
        list: newStartList
      }

      // make a new end list array
      const newEndList = end.list

      // insert the item into the end list
      newEndList.splice(destination.index, 0, start.list[source.index])

      // create a new end column
      const newEndCol = {
        id: end.id,
        list: newEndList
      }

      // update the state
      setColumns(state => ({
        ...state,
        [newStartCol.id]: newStartCol,
        [newEndCol.id]: newEndCol
      }))
      return null
    }
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="tol-dnd-section">
        {Object.values(columns).map(col => (
          <DnDColumn col={col} key={col.id} />
        ))}
      </div>
    </DragDropContext>
  )
}
export default CompareDnD;
