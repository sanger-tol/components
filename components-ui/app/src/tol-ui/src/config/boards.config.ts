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
    text: "Edit Board",
  },
  EDIT_MODE_EXIT: {
    ...BUTTONS.CONFIRM,
    type: "primary",
    text: "Exit Edit Mode",
  },
  LAYOUT_MODE_ENTER: {
    ...BUTTONS.EDIT,
    type: "warning",
    text: "Layout",
    tooltip: "Change Layout"
  },
  LAYOUT_MODE_EXIT: {
    ...BUTTONS.SAVE,
    text: "Save",
  },
  COPY_VIEW_ID: {
    ...BUTTONS.COPY,
    text: "Copy Current View",
    tooltip: "Copy View ID",
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
    text: "Copy Board",
    tooltip: "Copy Board",
    testid: "copy-board-button",
  },
  SHARE_BOARD: {
    ...BUTTONS.SHARE,
    testid: "share-board-button",
  },
  BOARD_CONFIG: {
    ...BUTTONS.SETTINGS,
    text: "",
    tooltip: "Board Options",
    testid: "board-options",
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
  NEW_VIEW: {
    ...BUTTONS.ADD,
    text: "New View",
    testid: "board-new-view-button",
    position: "left",
    tooltip: "",
  },
  ADD_VIEW: {
    ...BUTTONS.ADD,
    text: "Add View",
    icon: "pager",
    testid: "board-add-view-button",
    position: "left",
    tooltip: "",
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
