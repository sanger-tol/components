/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { BOARD_AND_VIEW_TITLE_EMPTY_MESSAGE } from "../../../constants";


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
        onEmptyMessage: BOARD_AND_VIEW_TITLE_EMPTY_MESSAGE,
      }
    : undefined;
};

export const ViewModeBoardTitle = (
  editable: boolean,
  text: string
) => {
  return editable ? undefined : [<h3 key="board-title">{text}</h3>];
};
