/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  BOARDS,
  IBoard,
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
import { Dispatch, SetStateAction } from "react";

export interface IBoardButtonsUtilityBar {
  setBoardCopyModalOpen: Dispatch<SetStateAction<boolean>>;
  setNewBoardCopyTitle: Dispatch<SetStateAction<string>>;
  setOpenAddZoneModal: Dispatch<SetStateAction<boolean>>;
  newBoardCopyTitle: string;
  activeViewId: string;
  boardDataSource: TsDataSource;
  setDeleteViewConfirmModal: Dispatch<SetStateAction<boolean>>;
  setActiveViewId: (viewId: string) => void;
  setViewImportModalOpen: Dispatch<SetStateAction<boolean>>;
}

export function BoardButtonsUtilityBar(props: IBoardButtonsUtilityBar) {
  const {
    setBoardCopyModalOpen,
    setNewBoardCopyTitle,
    setOpenAddZoneModal,
    newBoardCopyTitle,
    activeViewId,
    boardDataSource,
    setDeleteViewConfirmModal,
    setActiveViewId,
    setViewImportModalOpen,
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

  const utilityBarButtons = buildUtilityBarButtons(
    editMode,
    layoutMode,
    privilege,
    tableLoading,
    setEditMode,
    setLayoutMode,
    setBoardCopyModalOpen,
    newBoardCopyTitle,
    setNewBoardCopyTitle,
    board?.title || "",
  );

  const viewTabButtonArray = buildViewTabButtonArray(
    activeViewId,
    editMode,
    boardDataSource,
    setDeleteViewConfirmModal,
    setBoard,
    setActiveViewId,
    setViewImportModalOpen,
    board,
  );

  return (
    <div className="tol-board-bar">
      <UtilityBar
        id="tol-board-utility-bar"
        buttons={utilityBarButtons}
        title={editModeTitle(editMode, board?.title || "", (value) => {
          saveTitle(value, board?.id || "", boardDataSource, BOARDS.BOARD);
          setBoard({
            ...board,
            title: value,
          } as IBoard);
        })}
        elements={ViewModeBoardTitle(editMode, board?.title || "")}
      />
      {editMode || board?.order?.length > 1 ? (
        <UtilityBar
          id="tol-board-views-utility-bar"
          className="tol-views-bar"
          elements={viewTabButtonArray.flat()}
          buttons={[
            addZoneButton(
              () => setOpenAddZoneModal(true),
              editMode && !layoutMode,
            ),
          ]}
        />
      ) : null}
    </div>
  );
}
