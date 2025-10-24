/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { PButton } from "..";

export const buttons: Record<string, PButton> = {
  add: {
    type: "success",
    icon: "add",
    tooltip: "Add",
    disabledTooltip: "No changes to add",
  },
  save: {
    type: "success",
    icon: "save",
    tooltip: "Save Changes",
    disabledTooltip: "No changes to save",
  },
  return: {
    outline: true,
    type: "warning",
    icon: "arrow-left",
    tooltip: "Return",
  },
  discard: {
    type: "error",
    icon: "trash",
    tooltip: "Discard Changes",
    disabledTooltip: "No changes to discard",
  },
  close: {
    outline: true,
    type: "error",
    icon: "xmark",
    tooltip: "Close",
  },
  cancel: {
    outline: true,
    type: "error",
    icon: "xmark",
    tooltip: "Cancel",
  },
};