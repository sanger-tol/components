/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Draggable } from 'react-beautiful-dnd'


interface ItemProps {
  text: string
  index: number
}

function Item(props: ItemProps) {
  const { text, index } = props

  return (
    <Draggable draggableId={text} index={index}>
      {provided => (
        <div
          className="tol-dnd-item"
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          {text}
        </div>
      )}
    </Draggable>
  )
}

export default Item
