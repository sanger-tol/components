/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  upsertTitle,
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
  onOpenViewImportModal: () => void;
  onClickView: (viewId: string) => () => void;
  onAddView: () => void;
  onReorderView: (reorderedIds: string[]) => void;
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
    onOpenViewImportModal,
    onClickView,
    onAddView,
    onReorderView,
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
    onOpenViewImportModal,
    onClickView,
    onAddView,
    onReorderView,
    board,
    setBoard,
  );

  return (
    <div className="tol-board-bar">
      <UtilityBar
        id="tol-board-utility-bar"
        buttons={utilityBarButtons}
        title={editModeTitle(editMode, boardTitle, (newTitle: string) => {
          if (board?.id) {
            upsertTitle(newTitle, board.id, boardDataSource);
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
