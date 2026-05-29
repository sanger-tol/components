/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  BOARD_ENTITIES,
  BOARD_MESSAGE_TEXT,
  copyToClipboard,
  PRIVILEGE,
  BOARD_BUTTONS,
  BUTTONS,
} from "../../../..";
import type { PButton, PDropdownButton, TBoardPrivilegeOrUndefined } from "../../../..";


export interface IBoardButtonsBuilder {
  /**
   * ID of the currently active view.
   */
  activeViewId: string | null;
  /**
   * User privilege for the board.
   */
  privilege: TBoardPrivilegeOrUndefined;
  /**
   * Whether the board is in edit mode.
   */
  editMode: boolean;
  /**
   * Set edit mode state.
   */
  setEditMode: (value: boolean) => void;
  /**
   * Whether the board is in layout mode.
   */
  layoutMode: boolean;
  /**
   * Set layout mode state.
   */
  setLayoutMode: (value: boolean) => void;
  /**
   * True if a table is loading.
   */
  tableLoading: boolean;
  /**
   * Current board title.
   */
  boardTitle: string;
  /**
   * Title for the new board copy.
   */
  newBoardCopyTitle: string;
  /**
   * Set new board copy title.
   */
  setNewBoardCopyTitle: (value: string) => void;
  /**
   * Open the board copy modal.
   */
  onOpenBoardCopyModal: () => void;
}

/**
 * Returns the array of action buttons for a board.
 */
export function boardButtonsBuilder({
  activeViewId,
  privilege,
  editMode, setEditMode,
  layoutMode, setLayoutMode,
  tableLoading,
  boardTitle,
  newBoardCopyTitle, setNewBoardCopyTitle,
  onOpenBoardCopyModal,
}: IBoardButtonsBuilder) {
  const editOrExitButton: PButton = {
    ...(editMode ? BOARD_BUTTONS.EDIT_MODE_EXIT : BOARD_BUTTONS.EDIT_MODE_ENTER),
    visible: (privilege === PRIVILEGE.BOARD.WRITABLE && !layoutMode) || false,
    disabled: editMode && tableLoading,
    onClick: () => setEditMode(!editMode),
    testid: `board-${editMode ? "exit" : "enter"}-edit-mode-button`,
    tooltip:
      editMode && tableLoading
        ? "Please wait for the table to load before exiting edit mode."
        : "",
  };

  const layoutOrExitButton: PButton = {
    ...(layoutMode ? BOARD_BUTTONS.LAYOUT_MODE_EXIT : BOARD_BUTTONS.LAYOUT_MODE_ENTER),
    visible: (privilege === PRIVILEGE.BOARD.WRITABLE && editMode) || false,
    onClick: () => setLayoutMode(!layoutMode),
    testid: "board-layout-mode-button",
    tooltip: "",
  };

  const shareButton: PButton = {
    ...BOARD_BUTTONS.SHARE_BOARD,
    onClick: () => {
      copyToClipboard(
        window.location.href,
        BOARD_MESSAGE_TEXT(BOARD_ENTITIES.ENTITIES.BOARD).CLIPBOARD_COPY.URL_COPY,
      );
    },
  };

  const copyBoardButton: PButton = {
    ...BOARD_BUTTONS.COPY_BOARD,
    onClick: () => {
      if (!newBoardCopyTitle.trim()) {
        setNewBoardCopyTitle(`${boardTitle} - copy`);
      }
      onOpenBoardCopyModal();
    },
  };

  const copyViewIdButton: PButton = {
    ...BOARD_BUTTONS.COPY_VIEW_ID,
    onClick: () => {
      copyToClipboard(
        activeViewId!,
        BOARD_MESSAGE_TEXT(BOARD_ENTITIES.ENTITIES.VIEW).CLIPBOARD_COPY.ID_COPY
      );
    },
  };

  const copyButton: PDropdownButton = {
    toggle: BUTTONS.COPY,
    buttons: [copyBoardButton, copyViewIdButton],
  };

  return [
    editOrExitButton,
    layoutOrExitButton,
    copyButton,
    shareButton,
  ];
}
