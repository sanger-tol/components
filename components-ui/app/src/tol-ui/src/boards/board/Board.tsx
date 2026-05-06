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
  TsDataSource,
  View,
  useBoard,
  copyToClipboard,
  PRIVILEGE,
  TNavBrand,
  BUTTONS,
  UtilityBar,
  PButton,
  useAuth,
  getBoardEntity,
  IView,
  IBoard,
  dataObjectToViewParams,
  dataObjectToBoardParams,
  getUserPrivilege,
  SortableTabs,
  EditableTitle,
  getEntityPrefix,
  generateId,
  defineBoardEntityInParent,
  Button,
  ITab,
  BOARD_AND_VIEW_TITLE_EMPTY_MESSAGE,
  deleteBoardEntityInParent,
  ConfirmationModal,
  getNextTitle,
} from "../..";

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

  const { user } = useAuth();
  const {
    privilege,
    setPrivilege,
    editMode,
    setEditMode,
    layoutMode,
    setLayoutMode,
    board,
    setBoard
  } = useBoard();

  const { boardId: paramBoardId } = useParams<any>();
  const history = useHistory();
  const location = useLocation();

  const [activeViewId, setActiveViewId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteViewConfirmModal, setDeleteViewConfirmModal] = useState(false);
  const [openAddZoneModal, setOpenAddZoneModal] = useState(false);

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

  useEffect(() => {
    getBoardEntity<IBoard, IView>(
      boardDataSource,
      id,
      BOARDS.BOARD,
      board,
      dataObjectToViewParams,
      dataObjectToBoardParams,
    ).then((b: IBoard) => {
      setBoard(b);
      const viewFromUrl = new URLSearchParams(location.search).get("view");
      setActiveViewId(
        viewFromUrl && b.order?.includes(viewFromUrl) ? viewFromUrl : b.order?.[0]
      );
      setPrivilege(
        getUserPrivilege(user, b.ownerUserId, id)
      );
    }).finally(() => {
      setLoading(false);
    }).catch((e) => {
      console.error("Error fetching board data:", e);
      setError("Failed to load board.");
    });
  }, [id]);

  const updateViewInUrl = (viewId: string) => {
    const params = new URLSearchParams(location.search);
    params.set("view", viewId);
    history.replace({ search: params.toString() });
  };

  const onAddView = async () => {
    const id = generateId(getEntityPrefix(BOARDS.VIEW));
    setBoard({
      ...defineBoardEntityInParent<IView, IBoard>(
        {
          id: id,
          title: getNextTitle<IBoard>(board, BOARDS.BOARD, BOARDS.VIEW),
        },
        BOARDS.VIEW,
        board,
        BOARDS.BOARD
      )
    });
    setActiveViewId(id);
    updateViewInUrl(id);
  };

  const onClickView = (viewId: string) => () => {
    setActiveViewId(viewId);
    updateViewInUrl(viewId);
  }

  const onReorderViews = (orderedIds: string[]) => {
    board.order = orderedIds;
    setBoard({ ...board });
  };

  const onDeleteView = (viewId: string) => {
    // TODO: add delete back
    // boardDataSource
    //   .deleteByID({
    //     objectType: BOARDS.VIEW,
    //     viewId
    //   })
    deleteBoardEntityInParent<IBoard>(viewId, BOARDS.BOARD, board);
    setBoard({ ...board });
    setActiveViewId(board.order[0]);
  };

  if (error !== "") {
    return <Redirect to="/page-not-found" />;
  }

  if (loading) {
    return (
      <LoadingContent
        overlayNav
        brand={brand}
        text="Finding Board..."
      />
    );
  }

  const ViewTitle = (viewId: string, viewTitle: string) => {
    return (
      <EditableTitle
        text={viewTitle}
        editable={editMode && activeViewId === viewId}
        onSave={(value: string) => {
          saveTitle(value, viewId, boardDataSource, BOARDS.VIEW);
          setBoard({
            ...board,
            views: {
              ...board.views,
              [viewId]: {
                ...board.views?.[viewId],
                title: value,
              }
            }
          });
        }}
        hideButtons={true}
        emptyAllowed={false}
        onEmptyMessage={BOARD_AND_VIEW_TITLE_EMPTY_MESSAGE}
      />
    );
  }

  const viewTab = (viewId: string, viewTitle: string): PButton => ({
    id: viewId,
    text: ViewTitle(viewId, viewTitle),
    onClick: onClickView(viewId),
    className: "tol-view-tab",
    position: "left",
    visible: board.order.length > 1,
  });

  const deleteViewButton = (viewId: string): PButton => ({
    ...BUTTONS.DISCARD,
    onClick: () => setDeleteViewConfirmModal(true),
    position: "left",
    tooltip: "Delete View",
    outline: false,
    visible: editMode && activeViewId === viewId && board.order.length > 1,
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
  }

  const ViewTabs = [
    <Button
      {...BUTTONS.ADD}
      text="Add View"
      tooltip=""
      visible={editMode}
      onClick={onAddView}
      icon="pager"
      testid="board-add-view-button"
      position="left"
    />,
    <SortableTabs
      activeId={activeViewId!}
      className="tol-views-nav"
      onReorder={editMode && board.order.length > 1 ? onReorderViews : undefined}
      tabs={[
        ...board.order.map((viewId) => {
          const view = board.views?.[viewId];
          if (view) {
            return {
              buttons: [
                viewTab(view.id!, view.title!),
                deleteViewButton(view.id!),
              ],
            } as ITab;
          }
          return null;
        }).filter((btn): btn is ITab => btn !== null)
      ]}
    />
  ]

  const layoutOrExitLogic: PButton = layoutMode ? {
    ...BUTTONS.SAVE,
    text: "Save Layouts",
  } : {
    ...BUTTONS.EDIT,
    text: "Change Layout",
  };

  const layoutOrExitButton: PButton = {
    ...layoutOrExitLogic,
    visible: privilege === PRIVILEGE.BOARD.EDITABLE && editMode,
    onClick: () => setLayoutMode(!layoutMode),
    testid: "board-layout-mode-button",
    tooltip: "",
  }

  const editOrExitLogic: PButton = editMode ? {
    ...BUTTONS.CONFIRM,
    type: "primary",
    text: "Exit Edit Mode",
  } : {
    ...BUTTONS.EDIT,
    text: "Edit",
  };

  const editOrExitButton: PButton = {
    ...editOrExitLogic,
    visible: privilege === PRIVILEGE.BOARD.EDITABLE && !layoutMode,
    onClick: () => {
      setEditMode(!editMode);
    },
    testid: `board-${editMode ? "exit" : "enter"}-edit-mode-button`,
    tooltip: "",
  }

  const shareButton: PButton = {
    ...BUTTONS.SHARE,
    onClick: () => {
      copyToClipboard(location.href);
    },
  }

  // Different format used for the main Board title
  const editModeTitle = editMode ? {
    text: board.title,
    editable: editMode,
    onSave: (value: string) => {
      saveTitle(value, id, boardDataSource, BOARDS.BOARD);
      setBoard({
        ...board,
        title: value,
      });
    },
    hideButtons: true,
    emptyAllowed: false,
    onEmptyMessage: BOARD_AND_VIEW_TITLE_EMPTY_MESSAGE,
  } : undefined;

  // Large header for view mode
  const ViewModeBoardTitle = !editMode ? [(
    <h3>
      {board.title}
    </h3>
  )] : undefined;

  const BoardBar = (
    <div className="tol-board-bar">
      <UtilityBar
        id="tol-board-utility-bar"
        buttons={[
          editOrExitButton,
          layoutOrExitButton,
          shareButton,
        ]}
        title={editModeTitle}
        elements={ViewModeBoardTitle}
      />
      {editMode || board.order.length > 1 ? (
        <UtilityBar
          id="tol-board-views-utility-bar"
          className="tol-views-bar"
          elements={ViewTabs}
          buttons={[addZoneButton]}
        />
      ) : null}
    </div>
  )

  return (
    <div className={`tol-board ${editMode ? "tol-edit-mode" : ""}`} >
      {BoardBar}
      <View
        key={activeViewId}
        id={activeViewId!}
        boardDataSource={boardDataSource}
        actionsDataSource={actionsDataSource}
        open={openAddZoneModal}
        setOpen={setOpenAddZoneModal}
      />
      <ConfirmationModal
        open={deleteViewConfirmModal}
        setOpen={setDeleteViewConfirmModal}
        onConfirmClick={() => onDeleteView(activeViewId!)}
        itemType={BOARDS.VIEW}
      />
    </div >
  );
}
