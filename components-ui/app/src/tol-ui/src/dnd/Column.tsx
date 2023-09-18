/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import Item from './Item'
import { Droppable } from 'react-beautiful-dnd'


interface Props {
  col: {
    id: string
    list: string[]
  }
}

function Column(props: Props) {
  const { col } = props
  
  return (
    <Droppable droppableId={col.id}>
      {provided => (
        <div className='tol-dnd-column'>
          <h2>{col.id}</h2>
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {col.list.map((text, index) => (
              <Item key={text} text={text} index={index} />
            ))}
            {provided.placeholder}
          </div>
        </div>
      )}
    </Droppable>
  )
}

export default Column;
