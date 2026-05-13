/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import { Redirect, useHistory, useLocation, useParams } from "react-router-dom";
import {
  BOARDS,
  getCssVarValue,
  LoadingContent,
  saveTitle,
  themeListener,
  View,
  useBoard,
  copyToClipboard,
  PRIVILEGE,
  BUTTONS,
  UtilityBar,
  useQueryData,
  getBoardEntityAndChildren,
  URL_PATHS,
  MESSAGE_TYPE,
  BOARD_MESSAGE_TEXT,
  NewTitleModal,
  PopUpMessage,
  copyBoardEntity,
  API_UTILITY_OPERATIONS,
  SortableTabs,
  EditableTitle,
  getEntityPrefix,
  generateId,
  Button,
  BOARD_AND_VIEW_TITLE_EMPTY_MESSAGE,
  deleteBoardEntityInParent,
  ConfirmationModal,
  getNextTitle,
  MAX_VIEWS_ALLOWED_MESSAGE,
  Modal,
  PASTE_BUTTON,
} from "../..";
import type {
  IBoard,
  IView,
  PButton,
  TNavBrand,
  TsDataSource,
  ITab,
  IZone,
} from "../..";
import { Input } from "rsuite";

// TODO: Split into smaller components
// TODO: onAddView is very similar to view copy logic, make them the same.
// TODO: Fix imported view title.

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

  const {
    privilege,
    setPrivilege,
    editMode,
    setEditMode,
    tableLoading,
    layoutMode,
    setLayoutMode,
    board,
    setBoard,
  } = useBoard();

  const { boardId: paramBoardId } = useParams<any>();
  const history = useHistory();
  const location = useLocation();

  const [activeViewId, setActiveViewId] = useState<string | null>(null);
  const [mountedViewIds, setMountedViewIds] = useState<string[]>([]);
  const [deleteViewConfirmModal, setDeleteViewConfirmModal] = useState(false);
  const [openAddZoneModal, setOpenAddZoneModal] = useState(false);
  const [boardCopyModalOpen, setBoardCopyModalOpen] = useState<boolean>(false);
  const [newBoardCopyTitle, setNewBoardCopyTitle] = useState<string>("");
  const [viewImportModalOpen, setViewImportModalOpen] =
    useState<boolean>(false);
  const [viewImportId, setViewImportId] = useState<string>("");

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

  const updateViewInUrl = (viewId: string) => {
    const params = new URLSearchParams(location.search);
    params.set("view", viewId);
    history.replace({ search: params.toString() });
  };

  const onAddView = () => {
    const newViewId = generateId(getEntityPrefix(BOARDS.VIEW));
    const viewsMap = (board?.children?.[0] ?? {}) as Record<string, IView>;
    const newViewTitle = getNextTitle<IBoard>(
      { ...board, views: viewsMap } as any,
      BOARDS.BOARD,
      BOARDS.VIEW,
    );
    const newView: IView = {
      id: newViewId,
      title: newViewTitle,
      children: [{}] as Record<string, IZone>,
      order: [],
    };
    setBoard({
      ...board,
      children: [{ ...viewsMap, [newViewId]: newView }],
      order: [...(board?.order ?? []), newViewId],
    });
    setActiveViewId(newViewId);
    updateViewInUrl(newViewId);
  };

  const onClickView = (viewId: string) => () => {
    setActiveViewId(viewId);
    updateViewInUrl(viewId);
  };

  const onReorderViews = (orderedIds: string[]) => {
    if (board) {
      board.order = orderedIds;
      setBoard({ ...board });
    }
  };

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

  const onViewImport = async () => {
    const addedView = await copyBoardEntity(
      boardDataSource,
      viewImportId,
      API_UTILITY_OPERATIONS.VIEW_COPY,
      BOARDS.BOARD,
      setBoard,
      newBoardCopyTitle,
      BOARDS.VIEW,
      board,
      board?.id,
    );
    setViewImportId("");
    setViewImportModalOpen(false);
    setActiveViewId(addedView?.id ?? null);
  };

  if (isError) {
    return <Redirect to={URL_PATHS.PAGE_NOT_FOUND} />;
  }

  if (!isSuccess && !boardData && !board) {
    return <LoadingContent overlayNav brand={brand} text="Finding Board..." />;
  }

  const ViewTitle = (viewId: string, viewTitle: string) => {
    return (
      <EditableTitle
        text={viewTitle}
        editable={editMode && activeViewId === viewId}
        onSave={(value: string) => {
          saveTitle(value, viewId, boardDataSource, BOARDS.VIEW);
          if (board) {
            setBoard({
              ...board,
              children: {
                ...board.children,
                [viewId]: {
                  ...board.children?.[viewId],
                  title: value,
                },
              },
            } as IBoard);
          }
        }}
        hideButtons={true}
        emptyAllowed={false}
        onEmptyMessage={BOARD_AND_VIEW_TITLE_EMPTY_MESSAGE}
      />
    );
  };

  const ImportViewModal = (
    <Modal
      open={viewImportModalOpen}
      setOpen={setViewImportModalOpen}
      size={"sm"}
      actionButtonInline
      children={
        <>
          <h3>Import View</h3>
          <p style={{ marginBottom: "4px" }}>
            Import a view from another board using its View ID:
          </p>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Input
              placeholder={"Enter or paste view ID..."}
              value={viewImportId}
              onChange={(value: string) => setViewImportId(value)}
            />
            <Button {...PASTE_BUTTON((text) => setViewImportId(text))} />
          </div>
        </>
      }
      actionButton={
        <Button
          {...BUTTONS.CONFIRM}
          onClick={async () => await onViewImport()}
          disabledTooltip="Please ensure the entered id is a valid view ID."
          disabled={
            !viewImportId ||
            !viewImportId.includes("v_") ||
            viewImportId.length !== 14
          }
        />
      }
    />
  );

  const viewTab = (viewId: string, viewTitle: string): PButton => ({
    id: viewId,
    text: ViewTitle(viewId, viewTitle),
    onClick: onClickView(viewId),
    className: "tol-view-tab",
    position: "left",
    visible: board?.order?.length > 1,
  });

  const deleteViewButton = (viewId: string): PButton => ({
    ...BUTTONS.DISCARD,
    onClick: () => setDeleteViewConfirmModal(true),
    position: "left",
    tooltip: "Delete View",
    outline: false,
    visible: editMode && activeViewId === viewId && board?.order?.length > 1,
  });

  const copyViewIdToClipboard = (viewId: string) => ({
    ...BUTTONS.COPY,
    onClick: () => {
      copyToClipboard(viewId, "View ID copied to clipboard");
    },
    position: "left",
    tooltip: "Copy View ID",
    outline: false,
    visible: activeViewId === viewId && !editMode,
  });

  const addZoneButton: PButton = {
    ...BUTTONS.ADD,
    testid: "open-add-zone-modal-button",
    visible: editMode && !layoutMode,
    onClick: () => {
      setOpenAddZoneModal(true);
    },
    tooltip: "",
    text: "Add Zone",
    icon: "object-group",
  };

  const ViewTabs = [
    <Button
      {...BUTTONS.ADD}
      text="New View"
      tooltip=""
      visible={editMode}
      onClick={onAddView}
      icon="pager"
      testid="board-add-view-button"
      position="left"
      // Limit of 10 views per board
      disabled={board?.order?.length >= 10}
      disabledTooltip={MAX_VIEWS_ALLOWED_MESSAGE}
    />,
    <Button
      {...BUTTONS.ADD}
      text="Import View"
      tooltip="Import a view from another board using its View ID"
      visible={editMode}
      onClick={() => setViewImportModalOpen(true)}
      icon="file-import"
      testid="board-import-view-button"
      position="left"
      // Limit of 10 views per board (regardless of new or imported)
      disabled={board?.order?.length >= 10}
      disabledTooltip={MAX_VIEWS_ALLOWED_MESSAGE}
    />,
    <SortableTabs
      activeId={activeViewId!}
      className="tol-views-nav"
      onReorder={
        editMode && board?.order?.length > 1 ? onReorderViews : undefined
      }
      tabs={[
        ...(board?.order
          ?.map((viewId) => {
            const view = board?.children?.[0]?.[viewId];
            if (view) {
              return {
                buttons: [
                  viewTab(view.id!, view.title),
                  deleteViewButton(view.id),
                  copyViewIdToClipboard(view.id),
                ],
              } as ITab;
            }
            return null;
          })
          .filter((btn): btn is ITab => btn !== null) ?? []),
      ]}
    />,
  ];

  const layoutOrExitLogic: PButton = layoutMode
    ? {
        ...BUTTONS.SAVE,
        text: "Save Layouts",
      }
    : {
        ...BUTTONS.EDIT,
        text: "Change Layout",
      };

  const LayoutOrExitButton: PButton = {
    ...layoutOrExitLogic,
    visible: privilege === PRIVILEGE.BOARD.WRITABLE && editMode,
    onClick: () => setLayoutMode(!layoutMode),
    testid: "board-layout-mode-button",
    tooltip: "",
  };

  const editOrExitLogic: PButton = editMode
    ? {
        ...BUTTONS.CONFIRM,
        type: "primary",
        text: "Exit Edit Mode",
      }
    : {
        ...BUTTONS.EDIT,
        text: "Edit",
      };

  const EditOrExitButton: PButton = {
    ...editOrExitLogic,
    visible: privilege === PRIVILEGE.BOARD.WRITABLE && !layoutMode,
    disabled: editMode && tableLoading,
    onClick: () => {
      setEditMode(!editMode);
    },
    testid: `board-${editMode ? "exit" : "enter"}-edit-mode-button`,
    tooltip:
      editMode && tableLoading
        ? "Please wait for the table to load before exiting edit mode."
        : "",
  };

  const ShareButton: PButton = {
    ...BUTTONS.SHARE,
    onClick: () => {
      copyToClipboard(location.href, "Board URL copied to clipboard");
    },
  };

  const CopyButton: PButton = {
    ...BUTTONS.COPY,
    onClick: () => {
      if (!newBoardCopyTitle.trim()) {
        setNewBoardCopyTitle(`${board?.title} - copy`);
      }
      setBoardCopyModalOpen(true);
    },
    tooltip: "Copy Board",
  };

  // Different format used for the main Board title
  const editModeTitle = editMode
    ? {
        text: board?.title,
        editable: editMode,
        onSave: (value: string) => {
          saveTitle(value, id, boardDataSource, BOARDS.BOARD);
          setBoard({
            ...board,
            title: value,
          } as IBoard);
        },
        hideButtons: true,
        emptyAllowed: false,
        onEmptyMessage: BOARD_AND_VIEW_TITLE_EMPTY_MESSAGE,
      }
    : undefined;

  // Large header for view mode
  const ViewModeBoardTitle = !editMode ? [<h3>{board?.title}</h3>] : undefined;

  const BoardBar = (
    <div className="tol-board-bar">
      <UtilityBar
        id="tol-board-utility-bar"
        buttons={[
          EditOrExitButton,
          LayoutOrExitButton,
          ...(!editMode ? [ShareButton, CopyButton] : []),
        ]}
        title={editModeTitle}
        elements={ViewModeBoardTitle}
      />
      {editMode || board?.order?.length > 1 ? (
        <UtilityBar
          id="tol-board-views-utility-bar"
          className="tol-views-bar"
          elements={ViewTabs}
          buttons={[addZoneButton]}
        />
      ) : null}
    </div>
  );

  // returns the first view at the moment
  return (
    <div className={`tol-board ${editMode ? "tol-edit-mode" : ""}`}>
      {ImportViewModal}
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
          const copiedBoard = await copyBoardEntity(
            boardDataSource,
            id!,
            API_UTILITY_OPERATIONS.BOARD_COPY,
            BOARDS.BOARD,
            setBoard,
            newBoardCopyTitle,
            BOARDS.BOARD,
          );
          console.log(copiedBoard);
          if (copiedBoard) {
            const firstViewId = copiedBoard.order?.[0];
            console.log("copied board: ", firstViewId);
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
      {BoardBar}
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
