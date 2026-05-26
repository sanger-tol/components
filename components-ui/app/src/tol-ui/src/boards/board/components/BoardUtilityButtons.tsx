/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  IBoard,
  ITab,
  PRIVILEGE,
} from "../../..";
import {
  copyBoardButton,
  copyViewIdToClipboard,
  deleteViewButton,
  editOrExitButton,
  layoutOrExitButton,
  shareButton,
  viewSelectorTab,
} from ".";

export function buildBoardUtilityBarButtons(
  editMode: boolean,
  layoutMode: boolean,
  privilege: string | undefined,
  tableLoading: boolean,
  setEditMode: (value: boolean) => void,
  setLayoutMode: (value: boolean) => void,
  onOpenBoardCopyModal: () => void,
  newBoardCopyTitle: string,
  setNewBoardCopyTitle: (value: string) => void,
  boardTitle: string,
) {
  return [
    editOrExitButton(
      editMode,
      (privilege === PRIVILEGE.BOARD.WRITABLE && !layoutMode) || false,
      editMode && tableLoading,
      tableLoading,
      () => setEditMode(!editMode),
    ),
    layoutOrExitButton(
      layoutMode,
      (privilege === PRIVILEGE.BOARD.WRITABLE && editMode) || false,
      () => setLayoutMode(!layoutMode),
    ),
    ...(!editMode
      ? [
        shareButton,
        copyBoardButton(() => {
          if (!newBoardCopyTitle.trim()) {
            setNewBoardCopyTitle(`${boardTitle} - copy`);
          }
          onOpenBoardCopyModal();
        }),
      ]
      : []),
  ];
}

export function buildViewTab(
  viewId: string,
  viewTitle: string,
  activeViewId: string | null,
  editMode: boolean,
  onOpenDeleteViewModal: () => void,
  onClickView: (viewId: string) => () => void,
  board?: IBoard,
): ITab {
  const isMoreThanOneView = (board?.order?.length ?? 0) > 1;

  return {
    buttons: [
      viewSelectorTab(
        viewId,
        viewTitle,
        onClickView(viewId),
        isMoreThanOneView,
      ),
      deleteViewButton(
        onOpenDeleteViewModal,
        editMode && activeViewId === viewId && isMoreThanOneView,
      ),
      copyViewIdToClipboard(viewId, activeViewId === viewId && !editMode),
    ],
  };
}
