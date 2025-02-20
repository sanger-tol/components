/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Element } from "./DnD";
import { Draggable } from "react-beautiful-dnd";

interface Props {
  item: Element;
  index: number;
  editMode: boolean;
}

function Item(props: Props) {
  const { item, index, editMode } = props;

  if (editMode) {
    return (
      <Draggable
        // @ts-ignore
        style={{ top: "auto", left: "auto" }}
        draggableId={item.id}
        index={index}
      >
        {(provided: any, snapshot: any) => {
          if (snapshot.isDragging) {
            provided.draggableProps.style.left =
              provided.draggableProps.style.offsetLeft;
            provided.draggableProps.style.top =
              provided.draggableProps.style.offsetTop;
          }
          return (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
            >
              {item.element}
              {provided["placeholder"]}
            </div>
          );
        }}
      </Draggable>
    );
  }
  return item.element;
}

export default Item;
