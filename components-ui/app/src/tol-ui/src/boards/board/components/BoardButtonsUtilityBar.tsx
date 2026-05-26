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
  buildBoardUtilityBarButtons,
  editModeTitle,
  ViewModeBoardTitle,
  ViewTabs,
} from ".";

export interface IBoardUtilityBar {
  activeViewId: string | null;
  boardDataSource: TsDataSource;
  newBoardCopyTitle: string;
  onOpenBoardCopyModal: () => void;
  setNewBoardCopyTitle: (title: string) => void;
  onOpenAddZone: () => void;
  onClickView: (viewId: string) => () => void;
  onAddView: () => void;
  onReorderView: (reorderedIds: string[]) => void;
  onOpenDeleteViewModal: () => void;
  onOpenViewImportModal: () => void;
}

export function BoardUtilityBar(props: IBoardUtilityBar) {
  const {
    boardDataSource,
    newBoardCopyTitle,
    onOpenBoardCopyModal,
    setNewBoardCopyTitle,
    onOpenAddZone,
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

  const boardUtilityBarButtons = buildBoardUtilityBarButtons(
    editMode,
    layoutMode,
    privilege,
    tableLoading,
    setEditMode,
    setLayoutMode,
    onOpenBoardCopyModal,
    newBoardCopyTitle,
    setNewBoardCopyTitle,
    board?.title!,
  );

  const onSaveTitle = (newTitle: string) => {
    upsertTitle(newTitle, board.id!, boardDataSource);
    setBoard({ ...board, title: newTitle });
  }

  return (
    <div className="tol-board-bar">
      <UtilityBar
        id="tol-board-utility-bar"
        buttons={boardUtilityBarButtons}
        title={
          editModeTitle(
            editMode,
            board?.title!,
            onSaveTitle
          )
        }
        elements={ViewModeBoardTitle(editMode, board?.title!)}
      />
      {board?.order?.length > 1 && (
        <UtilityBar
          id="tol-board-views-utility-bar"
          className="tol-views-bar"
          elements={[
            <ViewTabs {...props} />
          ]}
          buttons={[
            addZoneButton(
              onOpenAddZone,
              editMode && !layoutMode,
            ),
          ]}
        />
      )}
    </div>
  );
}
