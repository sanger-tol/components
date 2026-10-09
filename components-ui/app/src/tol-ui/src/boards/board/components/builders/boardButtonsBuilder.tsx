/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  BOARD_ENTITIES,
  BOARD_MESSAGE_TEXT,
  copyToClipboard,
  PRIVILEGE,
  USER_ROLES,
  BOARD_BUTTONS,
  BUTTONS,
} from "../../../..";
import type { PButton, PDropdownButton, TBoardPrivilegeOrUndefined } from "../../../..";


export interface IBoardButtonsBuilder {
  /** ID of the currently active view. */
  activeViewId: string | null;
  /** User privilege for the board. */
  privilege: TBoardPrivilegeOrUndefined;
  /** Whether the board is in edit mode. */
  editMode: boolean;
  /** Callback for entering or exiting edit mode. */
  onEditModeClick: () => void;
  /** Whether the board is in layout mode. */
  layoutMode: boolean;
  /** Callback for layout mode button clicks. */
  onLayoutModeClick: () => void;
  /** Whether a table is loading. */
  tableLoading: boolean;
  /** Current board title. */
  boardTitle: string;
  /** Title for the new board copy. */
  newBoardCopyTitle: string;
  /** Sets the new board copy title. */
  setNewBoardCopyTitle: (value: string) => void;
  /** Opens the board copy modal. */
  onOpenBoardCopyModal: () => void;
  /** Opens the board configuration drawer. */
  onOpenBoardConfigDrawer: () => void;
  /** Whether copying the board is enabled. */
  allowBoardCopy: boolean;
  /** Whether the share button is hidden. */
  hideShareButton: boolean;
  /** Roles assigned to the current user. */
  roles: string[];
}

/** Builds the action buttons for a board. */
export function boardButtonsBuilder({
  activeViewId,
  privilege,
  editMode,
  onEditModeClick,
  layoutMode, onLayoutModeClick,
  tableLoading,
  boardTitle,
  newBoardCopyTitle, setNewBoardCopyTitle,
  onOpenBoardCopyModal,
  onOpenBoardConfigDrawer,
  allowBoardCopy,
  hideShareButton,
  roles,
}: IBoardButtonsBuilder) {
  const editOrExitButton: PButton = {
    ...(editMode ? BOARD_BUTTONS.EDIT_MODE_EXIT : BOARD_BUTTONS.EDIT_MODE_ENTER),
    visible: privilege === PRIVILEGE.BOARD.WRITABLE && !layoutMode,
    disabled: editMode && tableLoading,
    onClick: onEditModeClick,
    className: editMode ? undefined : "tol-edit-mode-button",
    testid: `board-${editMode ? "exit" : "enter"}-edit-mode-button`,
    tooltip:
      editMode && tableLoading
        ? "Please wait for the table to load before exiting edit mode."
        : "",
  };

  const layoutOrExitButton: PButton = {
    ...(layoutMode ? BOARD_BUTTONS.LAYOUT_MODE_EXIT : BOARD_BUTTONS.LAYOUT_MODE_ENTER),
    visible: (privilege === PRIVILEGE.BOARD.WRITABLE && editMode) || false,
    onClick: onLayoutModeClick,
    testid: "board-layout-mode-button",
    tooltip: "",
  };

  const shareButton: PButton = {
    ...BOARD_BUTTONS.SHARE_BOARD,
    visible: !hideShareButton,
    onClick: () => {
      copyToClipboard(
        window.location.href,
        BOARD_MESSAGE_TEXT(BOARD_ENTITIES.ENTITIES.BOARD).CLIPBOARD_COPY.URL_COPY,
      );
    },
  };

  const boardConfigButton: PButton = {
    ...BOARD_BUTTONS.BOARD_CONFIG,
    onClick: onOpenBoardConfigDrawer,
    visible: editMode && roles.includes(USER_ROLES.WARDEN),
  };

  const copyBoardButton: PButton = {
    ...BOARD_BUTTONS.COPY_BOARD,
    onClick: () => {
      if (!newBoardCopyTitle.trim()) {
        setNewBoardCopyTitle(`${boardTitle} - copy`);
      }
      onOpenBoardCopyModal();
    }
  };

  const copyViewIdButton: PButton = {
    ...BOARD_BUTTONS.COPY_VIEW_ID,
    onClick: () => {
      copyToClipboard(
        activeViewId!,
        BOARD_MESSAGE_TEXT(BOARD_ENTITIES.ENTITIES.VIEW).CLIPBOARD_COPY.ID_COPY
      );
    }
  };

  const copyButton: PDropdownButton = {
    toggle: { ...BUTTONS.COPY, visible: allowBoardCopy || editMode },
    buttons: [copyBoardButton, copyViewIdButton],
    testid: "board-copy-dropdown",
  };

  return {
    editOrExitButton,
    buttons: [layoutOrExitButton, boardConfigButton, copyButton, shareButton],
  };
}
