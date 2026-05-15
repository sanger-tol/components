/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  BOARDS,
  saveTitle,
  useBoard,
  UtilityBar,
  TsDataSource,
} from "../../..";
import {
  addZoneButton,
  buildUtilityBarButtons,
  buildViewTabButtonArray,
  editModeTitle,
  ViewModeBoardTitle,
} from ".";

export interface IBoardButtonsUtilityBar {
  onOpenBoardCopyModal: () => void;
  setNewBoardCopyTitle: (title: string) => void;
  onOpenAddZone: () => void;
  newBoardCopyTitle: string;
  activeViewId: string | null;
  boardDataSource: TsDataSource;
  onOpenDeleteViewModal: () => void;
  setActiveViewId: (viewId: string) => void;
  onOpenViewImportModal: () => void;
}

export function BoardButtonsUtilityBar(props: IBoardButtonsUtilityBar) {
  const {
    onOpenBoardCopyModal,
    setNewBoardCopyTitle,
    onOpenAddZone,
    newBoardCopyTitle,
    activeViewId,
    boardDataSource,
    onOpenDeleteViewModal,
    setActiveViewId,
    onOpenViewImportModal,
  } = props;

  const {
    privilege,
    editMode,
    setEditMode,
    tableLoading,
    layoutMode,
    setLayoutMode,
    board,
    setBoard,
  } = useBoard();

  const boardTitle = board?.title ?? "";

  const utilityBarButtons = buildUtilityBarButtons(
    editMode,
    layoutMode,
    privilege,
    tableLoading,
    setEditMode,
    setLayoutMode,
    onOpenBoardCopyModal,
    newBoardCopyTitle,
    setNewBoardCopyTitle,
    boardTitle,
  );

  const viewTabButtonArray = buildViewTabButtonArray(
    activeViewId,
    editMode,
    boardDataSource,
    onOpenDeleteViewModal,
    setBoard,
    setActiveViewId,
    onOpenViewImportModal,
    board,
  );

  return (
    <div className="tol-board-bar">
      <UtilityBar
        id="tol-board-utility-bar"
        buttons={utilityBarButtons}
        title={editModeTitle(editMode, boardTitle, (newTitle: string) => {
          if (board?.id) {
            saveTitle(newTitle, board.id, boardDataSource, BOARDS.BOARD);
            setBoard({ ...board, title: newTitle });
          }
        })}
        elements={ViewModeBoardTitle(editMode, boardTitle)}
      />
      {editMode || board?.order?.length > 1 ? (
        <UtilityBar
          id="tol-board-views-utility-bar"
          className="tol-views-bar"
          elements={viewTabButtonArray}
          buttons={[
            addZoneButton(
              onOpenAddZone,
              editMode && !layoutMode,
            ),
          ]}
        />
      ) : null}
    </div>
  );
}
