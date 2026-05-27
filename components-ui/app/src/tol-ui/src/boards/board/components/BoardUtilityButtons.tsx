/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  BOARD_AND_VIEW_TITLE_EMPTY_MESSAGE,
  EditableTitle,
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
  active: boolean,
  editMode: boolean,
  isMoreThanOneView: boolean,
  onOpenDeleteViewModal: () => void,
  onClickView: (viewId: string) => () => void,
  onSaveTitle: (viewId: string, newTitle: string) => void,
): ITab {

  const title = (
    <EditableTitle
      hideButtons
      text={viewTitle}
      editable={editMode && active}
      onSave={(newTitle: string) => onSaveTitle(viewId, newTitle)}
      emptyAllowed={false}
      onEmptyMessage={BOARD_AND_VIEW_TITLE_EMPTY_MESSAGE}
    />
  )

  return {
    buttons: [
      viewSelectorTab(
        viewId,
        title,
        onClickView(viewId),
        isMoreThanOneView,
        editMode,
      ),
      copyViewIdToClipboard(viewId, active),
      deleteViewButton(
        onOpenDeleteViewModal,
        editMode && active && isMoreThanOneView,
      ),
    ],
  };
}
