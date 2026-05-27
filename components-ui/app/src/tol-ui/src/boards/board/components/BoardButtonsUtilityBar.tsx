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

export interface IBoardButtonsUtilityBar {
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

export function BoardButtonsUtilityBar(props: IBoardButtonsUtilityBar) {
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

  const onSaveBoardTitle = (newTitle: string) => {
    upsertTitle(newTitle, board.id!, boardDataSource);
    setBoard({ ...board, title: newTitle });
  }

  const onSaveViewTitle = (viewId: string, newTitle: string) => {
    upsertTitle(newTitle, viewId, boardDataSource);
    setBoard({
      ...board,
      children: {
        ...board?.children,
        [viewId]: {
          ...board?.children?.[viewId],
          title: newTitle
        },
      },
    });
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
            onSaveBoardTitle
          )
        }
        elements={ViewModeBoardTitle(editMode, board?.title!)}
      />
      {(board?.order?.length > 1 || editMode) && (
        <UtilityBar
          id="tol-board-views-utility-bar"
          className="tol-views-bar"
          elements={[
            <ViewTabs onSaveTitle={onSaveViewTitle} {...props} />
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
