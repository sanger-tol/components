/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { BOARD_AND_VIEW_TITLE_EMPTY_MESSAGE } from "../../../constants";
import { EditableTitle } from "../../..";

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

export const ViewTitle = (
  editable: boolean,
  text: string,
  onSave: (value: string) => void,
) => {
  return (
    <EditableTitle
      text={text}
      editable={editable}
      onSave={onSave}
      hideButtons={true}
      emptyAllowed={false}
      onEmptyMessage={BOARD_AND_VIEW_TITLE_EMPTY_MESSAGE}
    />
  );
};

export const ViewModeBoardTitle = (editable: boolean, title: string) =>
  !editable ? [<h3 key="board-title">{title}</h3>] : undefined;
