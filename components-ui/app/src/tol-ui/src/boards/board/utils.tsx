/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  BOARDS,
  IDataObject,
  IView,
  defineBoardEntity,
  BOARD_CHILDREN_KEYS,
  IBoard,
} from "../..";


export function dataObjectToViewParams(viewDataObject: IDataObject): Partial<IView> {
  return defineBoardEntity<IView>(
    {
      id: viewDataObject.id,
      title: viewDataObject.title,
    },
    BOARDS.VIEW,
    BOARD_CHILDREN_KEYS.ZONES
  );
}

export function dataObjectToBoardParams(boardDataObject: IDataObject): Partial<IBoard> {
  const owner = boardDataObject.relationships?.user as IDataObject;
  return {
    title: boardDataObject.title,
    ownerUserId: owner.id,
  }
}
