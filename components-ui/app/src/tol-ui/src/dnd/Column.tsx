/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useRef } from 'react';
import { Col } from '../index';
import { Element } from './DnD';
import Item from './Item';
import { Droppable } from 'react-beautiful-dnd';


interface Col {
  id: string
  list: Element[]
}

interface Props {
  col: Col,
  editMode: boolean
}

function Column(props: Props) {
  const { col, editMode } = props;
  const ref = useRef<any>(null);
  
  return (
    <Col
      key={`tol-widget-${col.id}`}
      sm={12}
      lg={6}
      style={{ paddingLeft: 0, paddingRight: 0 }}
      refs={ref}
    >
      <h5 className='tol-dnd-column-title'>{col.id}</h5>
      <Droppable droppableId={col.id}>
        {(provided, snapshot) => (
          <div className={snapshot.isDraggingOver ? 'tol-dnd-column-drop' : 'tol-dnd-column'} >
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {col.list.map((item, index) => (
                <Item key={item.id} item={item} index={index} editMode={editMode} />
              ))}
              {provided.placeholder}
            </div>
          </div>
        )}
      </Droppable>
    </Col>
  );
}

export default Column;

// snapshot.isDraggingOver (provided, snapshot)
