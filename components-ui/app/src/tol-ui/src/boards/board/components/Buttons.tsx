/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { BUTTONS, copyToClipboard } from "../../..";
import type { PButton } from "../../..";

export const copyViewIdToClipboard = (
  viewId: string,
  visible: boolean,
): PButton => ({
  ...BUTTONS.COPY,
  onClick: () => {
    copyToClipboard(viewId, "View ID copied to clipboard");
  },
  position: "left",
  tooltip: "Copy View ID",
  outline: false,
  visible: visible,
});

export const addZoneButton = (
  setOpenAddZoneModal: (open: boolean) => void,
  visible: boolean,
): PButton => ({
  ...BUTTONS.ADD,
  testid: "open-add-zone-modal-button",
  visible: visible,
  onClick: () => {
    setOpenAddZoneModal(true);
  },
  tooltip: "",
  text: "Add Zone",
  icon: "object-group",
});

export const copyBoardButton = (
  setNewBoardCopyTitle: (title: string) => void,
  setBoardCopyModalOpen: (open: boolean) => void,
  board: { title?: string },
  newBoardCopyTitle: string,
): PButton => ({
  ...BUTTONS.COPY,
  onClick: () => {
    if (!newBoardCopyTitle.trim()) {
      setNewBoardCopyTitle(`${board?.title} - copy`);
    }
    setBoardCopyModalOpen(true);
  },
  tooltip: "Copy Board",
});
