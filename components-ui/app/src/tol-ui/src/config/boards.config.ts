/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type { PButton } from "..";
import { BUTTONS } from "./buttons.config";

export const BOARD_BUTTONS: Record<string, PButton> = {
  EDIT_MODE_ENTER: {
    ...BUTTONS.EDIT,
    type: "warning",
    text: "Edit",
  },
  EDIT_MODE_EXIT: {
    ...BUTTONS.CONFIRM,
    type: "primary",
    text: "Exit Edit Mode",
  },
  LAYOUT_MODE_ENTER: {
    ...BUTTONS.EDIT,
    type: "warning",
    text: "Change Layout",
  },
  LAYOUT_MODE_EXIT: {
    ...BUTTONS.SAVE,
    text: "Save Layouts",
  },
  COPY_VIEW_ID: {
    ...BUTTONS.COPY,
    position: "left",
    tooltip: "Copy View ID",
    outline: false,
    testid: "copy-view-id-button",
    className: "tol-copy-view-id-button",
  },
  ADD_ZONE: {
    ...BUTTONS.ADD,
    testid: "open-add-zone-modal-button",
    tooltip: "",
    text: "Add Zone",
    icon: "object-group",
  },
  COPY_BOARD: {
    ...BUTTONS.COPY,
    tooltip: "Copy Board",
    testid: "copy-board-button",
  },
  SHARE_BOARD: {
    ...BUTTONS.SHARE,
    testid: "share-board-button",
  },
  DELETE_VIEW: {
    ...BUTTONS.DISCARD,
    testid: "delete-view-button",
    position: "left",
    tooltip: "Delete View",
    outline: false,
  },
  VIEW_TAB: {
    className: "tol-view-tab",
    position: "left",
    testid: "tab-view-selector-button",
  },
  ADD_VIEW: {
    ...BUTTONS.ADD,
    text: "New View",
    icon: "pager",
    testid: "board-add-view-button",
    position: "left",
  },
  IMPORT_VIEW: {
    ...BUTTONS.ADD,
    text: "Import View",
    tooltip: "Import a view from another board using its View ID",
    icon: "file-import",
    testid: "board-import-view-button",
    position: "left",
  },
};
