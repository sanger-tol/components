/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { BOARD_ENTITIES, BOARD_MESSAGE_TEXT } from "../../..";

export const editModeTitle = (
  editable: boolean,
  text: string,
  onSave: (value: string) => void,
) => {
  return editable
    ? {
        text: text,
        editable: true,
        onSave: onSave,
        hideButtons: true,
        emptyAllowed: false,
        onEmptyMessage: BOARD_MESSAGE_TEXT(BOARD_ENTITIES.ENTITIES.BOARD).MISC
          .EMPTY_TITLE_ERROR,
      }
    : undefined;
};

export const ViewModeBoardTitle = (
  editable: boolean,
  text: string
) => {
  return editable ? undefined : [<h3 key="board-title">{text}</h3>];
};
