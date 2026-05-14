/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import { Redirect, useLocation, useParams } from "react-router-dom";
import {
  BOARDS,
  getCssVarValue,
  LoadingContent,
  themeListener,
  View,
  useBoard,
  PRIVILEGE,
  useQueryData,
  getBoardEntityAndChildren,
  URL_PATHS,
  MESSAGE_TYPE,
  BOARD_MESSAGE_TEXT,
  NewTitleModal,
  PopUpMessage,
  deleteBoardEntityInParent,
  ConfirmationModal,
  copyBoard,
} from "../..";
import type { IBoard, TNavBrand, TsDataSource } from "../..";
import { BoardButtonsUtilityBar, ImportViewModal } from "./components";

// TODO: onAddView is very similar to view copy logic, make them the same.
// TODO: FIX ALL THE STYLING FOR TAB BUTTONS... THEY ARE A MESS RIGHT NOW

export interface PBoard {
  /**
   * The ID of the board to be displayed.
   */
  boardId?: string;
  /**
   * The data source for fetching board data.
   */
  boardDataSource: TsDataSource;
  /**
   * The data source for fetching actions.
   */
  actionsDataSource?: TsDataSource;
  /**
   * The brand to display in the loading screen.
   */
  brand?: TNavBrand;
}

/**
 * Component to render a board based on its ID and TSDataSource.
 */
export function Board(props: PBoard) {
  const { boardId, boardDataSource, brand, actionsDataSource } = props;

  const { setPrivilege, editMode, board, setBoard } = useBoard();

  const { boardId: paramBoardId } = useParams<any>();
  const location = useLocation();

  const [activeViewId, setActiveViewId] = useState<string | null>(null);
  const [mountedViewIds, setMountedViewIds] = useState<string[]>([]);
  const [deleteViewConfirmModal, setDeleteViewConfirmModal] = useState(false);
  const [openAddZoneModal, setOpenAddZoneModal] = useState(false);
  const [boardCopyModalOpen, setBoardCopyModalOpen] = useState<boolean>(false);
  const [newBoardCopyTitle, setNewBoardCopyTitle] = useState<string>("");
  const [viewImportId, setViewImportId] = useState<string>("");
  const [viewImportModalOpen, setViewImportModalOpen] =
    useState<boolean>(false);

  // Ability to override boardId from props over URL params
  const id = boardId ?? paramBoardId;

  themeListener(() => {
    try {
      const backing = document.getElementById("tol-smart-app-background");
      backing!.style.backgroundColor = getCssVarValue("--tol-bg-dark");
    } catch {
      return;
    }
  });

  const {
    data: boardData,
    isSuccess,
    isError,
  } = useQueryData<IBoard>(
    [BOARDS.BOARD, id],
    () => getBoardEntityAndChildren(boardDataSource, id, BOARDS.BOARD),
    { enabled: !!id },
  );

  useEffect(() => {
    if (!boardData || !isSuccess) return;
    setBoard(boardData as IBoard);
    setPrivilege(
      boardData.write_privilege
        ? PRIVILEGE.BOARD.WRITABLE
        : PRIVILEGE.BOARD.VIEWABLE,
    );
    const viewFromUrl = new URLSearchParams(location.search).get("view");
    setActiveViewId(
      viewFromUrl && boardData.order?.includes(viewFromUrl)
        ? viewFromUrl
        : boardData.order?.[0],
    );
  }, [isSuccess]);

  // Preload the current and two most recently accessed views for faster loading when switching between them
  useEffect(() => {
    if (!activeViewId) return;
    setMountedViewIds((prev) =>
      [...prev.filter((vid) => vid !== activeViewId), activeViewId].slice(-3),
    );
  }, [activeViewId]);

  const onDeleteView = (viewId: string) => {
    // TODO: add delete back
    // boardDataSource
    //   .deleteByID({
    //     objectType: BOARDS.VIEW,
    //     viewId
    //   })
    if (board) {
      deleteBoardEntityInParent<IBoard>(viewId, BOARDS.BOARD, board);
      setBoard({ ...board });
      setMountedViewIds((prev) => prev.filter((vid) => vid !== viewId));
      setActiveViewId(board.order[0]);
    }
  };

  if (isError) {
    return <Redirect to={URL_PATHS.PAGE_NOT_FOUND} />;
  }

  if (!isSuccess && !boardData && !board) {
    return <LoadingContent overlayNav brand={brand} text="Finding Board..." />;
  }

  return (
    <div className={`tol-board ${editMode ? "tol-edit-mode" : ""}`}>
      <ImportViewModal
        open={viewImportModalOpen}
        onClose={() => {
          setViewImportModalOpen(false);
          setViewImportId("");
        }}
        boardDataSource={boardDataSource}
        viewImportId={viewImportId}
        setViewImportId={setViewImportId}
        setActiveViewId={setActiveViewId}
        newViewTitle={"view - copy"}
      />
      <NewTitleModal
        open={boardCopyModalOpen}
        setOpen={setBoardCopyModalOpen}
        title={newBoardCopyTitle}
        setTitle={setNewBoardCopyTitle}
        itemType={BOARDS.BOARD}
        confirmationAction={async () => {
          if (!newBoardCopyTitle.trim()) {
            PopUpMessage({
              type: MESSAGE_TYPE.WARNING,
              message: BOARD_MESSAGE_TEXT(BOARDS.BOARD).BOARD_COPY
                .NO_TITLE_ERROR,
            });
            return;
          }
          const copiedBoard = await copyBoard(
            boardDataSource,
            id!,
            BOARDS.BOARD,
            setBoard,
            newBoardCopyTitle,
            BOARDS.BOARD,
          );
          if (copiedBoard) {
            const firstViewId = copiedBoard.order?.[0];
            if (firstViewId) {
              setActiveViewId(firstViewId);
              setMountedViewIds([firstViewId]);
            }
          }
          setBoardCopyModalOpen(false);
        }}
        onExited={() => {
          !newBoardCopyTitle.trim()
            ? setNewBoardCopyTitle(`${board?.title} - copy`)
            : null;
        }}
        userInfoHelp={
          <>
            <h3>Save a copy of this board</h3>
            <p>
              You are about to create a copy of this board, would you like to
              rename it before copying?
            </p>
          </>
        }
      />
      <BoardButtonsUtilityBar
        onOpenBoardCopyModal={() => setBoardCopyModalOpen(true)}
        setNewBoardCopyTitle={setNewBoardCopyTitle}
        onOpenAddZone={() => setOpenAddZoneModal(true)}
        newBoardCopyTitle={newBoardCopyTitle}
        activeViewId={activeViewId || ""}
        boardDataSource={boardDataSource}
        onOpenDeleteViewModal={() => setDeleteViewConfirmModal(true)}
        setActiveViewId={setActiveViewId}
        onOpenViewImportModal={() => setViewImportModalOpen(true)}
      />
      {mountedViewIds.map((viewId) => (
        <View
          key={viewId}
          id={viewId}
          boardDataSource={boardDataSource}
          actionsDataSource={actionsDataSource}
          open={openAddZoneModal && viewId === activeViewId}
          setOpen={setOpenAddZoneModal}
          active={viewId === activeViewId}
        />
      ))}
      <ConfirmationModal
        open={deleteViewConfirmModal}
        setOpen={setDeleteViewConfirmModal}
        onConfirmClick={() => onDeleteView(activeViewId!)}
        itemType={BOARDS.VIEW}
      />
    </div>
  );
}
