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
  BACK: {
    outline: true,
    type: "warning",
    icon: "arrow-left",
    tooltip: "Back",
  },
  CANCEL: {
    outline: true,
    type: "error",
    icon: "xmark",
    tooltip: "Cancel",
    position: "right",
  },
  CLOSE: {
    outline: true,
    type: "error",
    icon: "xmark",
    tooltip: "Close",
    position: "right",
  },
  CONFIRM: {
    type: "success",
    icon: "check",
    tooltip: "Confirm",
    disabledTooltip: "No changes to confirm",
    position: "right",
  },
  DISCARD: {
    type: "error",
    icon: "trash",
    tooltip: "Discard Changes",
    disabledTooltip: "No changes to discard",
    position: "right",
  },
  DOWNLOAD: {
    outline: true,
    type: "primary",
    icon: "download",
    tooltip: "Download",
    disabledTooltip: "Download unavailable",
    position: "right",
  },
  EDIT: {
    outline: true,
    type: "warning",
    icon: "pen-to-square",
    tooltip: "Edit",
    position: "right",
  },
  OK: {
    text: "OK",
    position: "right",
  },
  RETURN: {
    outline: true,
    type: "warning",
    icon: "arrow-left",
    tooltip: "Return",
  },
  SAVE: {
    type: "success",
    icon: "save",
    tooltip: "Save Changes",
    disabledTooltip: "No changes to save",
    position: "right",
  },
  SHARE: {
    outline: true,
    type: "primary",
    icon: "share-from-square",
    tooltip: "Share",
    position: "right",
  },
};