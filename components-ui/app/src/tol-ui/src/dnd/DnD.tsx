/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Row } from "../index";
import { useState, useEffect, useRef } from "react";
import Column from "./Column";
import { DragDropContext, DropResult } from "react-beautiful-dnd";


export interface Element {
  id: string,
  element: JSX.Element
}

interface Columns {
  [key: string]: Element[]
}

interface Props {
  elements: object,
  setContents?: any
  editMode?: boolean,
  dealWithContents?: (column: object) => boolean
}

function convertElementsData(columns: Columns) {
  const cols = {};
  for (const [key, elements] of Object.entries(columns)) {
    cols[key] = {
      id: key,
      list: elements
    };
  }
  return cols;
}

function DnD(props: Props) {
  const { elements, setContents, dealWithContents } = props;
  const [columns, setColumns] = useState<object>(
    convertElementsData(elements as Columns)
  );
  const ref = useRef<any>(null);
  let editMode = true;
  if (props.editMode === false) editMode = false;

  const onDragEnd = ({ source, destination }: DropResult) => {
    // make sure we have a valid destination
    if (destination === undefined || destination === null) return null;

    // make sure we're actually moving the item
    if (source.droppableId === destination.droppableId &&
        destination.index === source.index) {
      return null;
    }

    // set start and end variables
    const start = columns[source.droppableId];
    const end = columns[destination.droppableId];

    // if start is the same as end, we're in the same column
    if (start === end) {
      // move the item within the list
      // start by making a new list without the dragged item
      const newList = start.list.filter(
        (_: any, idx: number) => idx !== source.index
      );

      // then insert the item at the right location
      newList.splice(destination.index, 0, start.list[source.index]);

      // then create a new copy of the column object
      const newCol = {
        id: start.id,
        list: newList
      };

      // update the state
      setColumns(state => ({ ...state, [newCol.id]: newCol }));
    } else {
      // ff start is different from end, we need to update multiple columns
      // filter the start list like before
      const newStartList = start.list.filter(
        (_: any, idx: number) => idx !== source.index
      );

      // create a new start column
      const newStartCol = {
        id: start.id,
        list: newStartList
      };

      // stop on drop with custom function
      if (dealWithContents !== undefined) {
        // false = don't allow drop
        if (!dealWithContents(newStartCol)) return null;
      }

      // make a new end list array
      const newEndList = end.list;

      // insert the item into the end list
      newEndList.splice(destination.index, 0, start.list[source.index]);

      // create a new end column
      const newEndCol = {
        id: end.id,
        list: newEndList
      };

      // update the state
      setColumns(state => ({
        ...state,
        [newStartCol.id]: newStartCol,
        [newEndCol.id]: newEndCol
      }));
    }
    return null;
  };

  useEffect(() => {
    // accessing the data outside of the component
    if (setContents !== undefined) {
      setContents(columns);
    }
  }, [columns]);

  return (
    <DragDropContext onDragEnd={onDragEnd} ref={ref}>
      <Row style={{
        marginLeft: 0,
        marginRight: 0,
        paddingLeft: 0,
        paddingRight: 0,
      }}>
        {Object.values(columns).map(col => (
          <Column col={col} key={col.id} editMode={editMode} />
        ))}
      </Row>
    </DragDropContext>
  );
}

export default DnD;
