/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import { Redirect, useLocation, useParams } from "react-router-dom";
import {
  BOARD_ENTITIES,
  getCssVarValue,
  LoadingContent,
  themeListener,
  View,
  useBoard,
  PRIVILEGE,
  useQueryData,
  fetchBoardEntityAndChildren,
  URL_PATHS,
  MESSAGE_TYPE,
  BOARD_MESSAGE_TEXT,
  NewTitleModal,
  PopUpMessage,
  removeBoardEntityInParent,
  ConfirmationModal,
  copyBoard,
  deleteBoardEntity,
  postAddBoardEntity,
  updateViewInUrl,
  patchReorderBoardEntity,
  defineBoardEntityInParent,
  isEmptyObject,
} from "../..";
import { BoardUtilityBar, ImportViewModal } from "./components";
import type { IBoard, TNavBrand, TsDataSource } from "../..";


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
    isLoading,
  } = useQueryData<IBoard>(
    [BOARD_ENTITIES.ENTITIES.BOARD, id],
    () => fetchBoardEntityAndChildren(boardDataSource, id!) as Promise<IBoard>,
    { enabled: !!id },
  );

  const isBoardNotFound = isSuccess && !boardData?.id;

  useEffect(() => {
    if (!isSuccess || !boardData?.id) return;
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

  // Scroll listener for sticky board bar shadow effect
  useEffect(() => {
    const bar = document.querySelector<HTMLElement>(".tol-board-bar");
    if (!bar) return;
    const onScroll = () => {
      const progress = Math.min(window.scrollY / 20, 1);
      bar.style.setProperty("--tol-bar-scroll", progress.toString());
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onClickView = (viewId: string) => () => {
    setActiveViewId(viewId);
    updateViewInUrl(viewId);
  };

  const onAddView = async () => {
    postAddBoardEntity(boardDataSource, board?.id!).then((res) => {
      const view = res.data;
      const b = defineBoardEntityInParent(
        BOARD_ENTITIES.ENTITIES.VIEW,
        view,
        board,
      ) as IBoard;
      setBoard({ ...b });
      setActiveViewId(view.id);
      updateViewInUrl(view.id);
    });
  };

  const onReorderViews = (reorderedIds: string[]) => {
    patchReorderBoardEntity(boardDataSource, board?.id!, reorderedIds).then(
      () => {
        board.order = reorderedIds;
        setBoard({ ...board });
      },
    );
  };

  const onDeleteView = async (viewId: string) => {
    await deleteBoardEntity(boardDataSource, viewId).then(
      (status: string | void) => {
        if (status !== "success") return;
        removeBoardEntityInParent(viewId, board);
        setBoard({ ...board });
        setMountedViewIds((prev) => prev.filter((vid) => vid !== viewId));
        setActiveViewId(board.order[0]);
        updateViewInUrl(board.order[0]);
      },
    );
  };

  if (isError || isBoardNotFound) {
    return <Redirect to={URL_PATHS.PAGE_NOT_FOUND} />;
  }

  if (isLoading && !isSuccess && isEmptyObject(boardData) && isEmptyObject(board)) {
    return <LoadingContent text="Getting the board ready..." />;
  }

  return (
    <div className={`tol-board${editMode ? " tol-edit-mode" : ""}`}>
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
      />
      <NewTitleModal
        open={boardCopyModalOpen}
        setOpen={setBoardCopyModalOpen}
        title={newBoardCopyTitle}
        setTitle={setNewBoardCopyTitle}
        itemType={BOARD_ENTITIES.ENTITIES.BOARD}
        confirmationAction={async () => {
          if (!newBoardCopyTitle.trim()) {
            PopUpMessage({
              type: MESSAGE_TYPE.WARNING,
              message: BOARD_MESSAGE_TEXT(BOARD_ENTITIES.ENTITIES.BOARD)
                .BOARD_COPY.NO_TITLE_ERROR,
            });
            return;
          }
          const copiedBoard = await copyBoard(
            boardDataSource,
            id!,
            newBoardCopyTitle,
            BOARD_ENTITIES.ENTITIES.BOARD,
          );
          if (copiedBoard) {
            setBoard(copiedBoard);
            const firstViewId = copiedBoard.order?.[0];
            if (firstViewId) {
              setActiveViewId(firstViewId);
              setMountedViewIds([firstViewId]);
            }
          }
          setPrivilege(
            copiedBoard?.write_privilege
              ? PRIVILEGE.BOARD.WRITABLE
              : PRIVILEGE.BOARD.VIEWABLE,
          );
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
      <BoardUtilityBar
        onOpenBoardCopyModal={() => setBoardCopyModalOpen(true)}
        setNewBoardCopyTitle={setNewBoardCopyTitle}
        onOpenAddZone={() => setOpenAddZoneModal(true)}
        newBoardCopyTitle={newBoardCopyTitle}
        activeViewId={activeViewId}
        boardDataSource={boardDataSource}
        onOpenDeleteViewModal={() => setDeleteViewConfirmModal(true)}
        onOpenViewImportModal={() => setViewImportModalOpen(true)}
        onClickView={onClickView}
        onAddView={onAddView}
        onReorderView={onReorderViews}
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
        itemType={BOARD_ENTITIES.ENTITIES.VIEW}
      />
    </div>
  );
}
