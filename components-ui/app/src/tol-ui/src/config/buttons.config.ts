/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { PButton } from "..";

export const BUTTONS: Record<string, PButton> = {
  ADD: {
    type: "success",
    icon: "add",
    tooltip: "Add",
    disabledTooltip: "No changes to add",
    position: "right",
  },
  CONFIRM: {
    type: "success",
    icon: "check",
    tooltip: "Confirm",
    disabledTooltip: "No changes to confirm",
    position: "right",
  },
  SAVE: {
    type: "success",
    icon: "save",
    tooltip: "Save Changes",
    disabledTooltip: "No changes to save",
    position: "right",
  },
  RETURN: {
    outline: true,
    type: "warning",
    icon: "arrow-left",
    tooltip: "Return",
  },
  BACK: {
    outline: true,
    type: "warning",
    icon: "arrow-left",
    tooltip: "Back",
  },
  DISCARD: {
    type: "error",
    icon: "trash",
    tooltip: "Discard Changes",
    disabledTooltip: "No changes to discard",
    position: "right",
  },
  CLOSE: {
    outline: true,
    type: "error",
    icon: "xmark",
    tooltip: "Close",
    position: "right",
  },
  CANCEL: {
    outline: true,
    type: "error",
    icon: "xmark",
    tooltip: "Cancel",
    position: "right",
  },
  OK: {
    text: "OK",
    position: "right",
  },
  EDIT: {
    outline: true,
    type: "warning",
    icon: "pen-to-square",
    tooltip: "Edit",
    position: "right",
  },
  SHARE: {
    outline: true,
    type: "primary",
    icon: "share-from-square",
    tooltip: "Share",
    position: "right",
  },
  TRANSLATORS: {
    outline: true,
    type: "primary",
    icon: "arrow-down-wide-short",
    tooltip: "Translate Filters from one Object Type to another",
    position: "right",
  }
};