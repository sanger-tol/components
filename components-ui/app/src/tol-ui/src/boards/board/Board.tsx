/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import { Redirect, useParams } from "react-router-dom";
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
  TabsNav,
  EditableTitle,
  getEntityPrefix,
  generateId,
  defineBoardEntityInParent,
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

  const [currentViewId, setCurrentViewId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      setCurrentViewId(b.order?.[0] ?? null);
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

  const onLayoutModeToggle = () => {
    setLayoutMode(!layoutMode);
  };

  const onAddView = async () => {
    const id = generateId(getEntityPrefix(BOARDS.VIEW));
    const nextViewNumber = board.order.length + 1;
    setBoard({
      ...defineBoardEntityInParent<IView, IBoard>(
        {
          id: id,
          title: `View ${nextViewNumber}`,
        },
        BOARDS.VIEW,
        board,
        BOARDS.BOARD
      )
    });
  };

  const onViewClick = (viewId: string) => () => {
    setCurrentViewId(viewId);
    console.log("View clicked:", viewId);
  }

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
    onClick: onLayoutModeToggle,
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
    }
  } : undefined;

  // Large header for view mode
  const viewModeTitle = !editMode ? [(
    <h3>
      {board.title}
    </h3>
  )] : undefined;

  const ViewTitle = (view: IView) => {
    return (
      <EditableTitle
        text={view.title}
        editable={editMode}
        onSave={(value: string) => {
          // Save view title
        }}
      />
    );
  }

  const BoardBar = (
    <div className="tol-board-bar">
      <UtilityBar
        id="board-utility-bar"
        buttons={[
          editOrExitButton,
          layoutOrExitButton,
          shareButton,
        ]}
        title={editModeTitle}
        elements={viewModeTitle}
      />
      <TabsNav
        buttons={[
          ...board.order.map((viewId) => {
            const view = board.views?.[viewId];
            if (view) {
              return {
                className: "tol-board-view-tab",
                text: ViewTitle(view),
                onClick: onViewClick(view.id!),
              } as PButton;
            }
            return null;
          }).filter((btn): btn is PButton => btn !== null),
          {
            ...BUTTONS.ADD,
            text: "Add View",
            visible: editMode,
            onClick: onAddView,
            icon: "pager",
            testid: "board-add-view-button",
          },
        ]}
      />
    </div>
  )

  const classMode = () => {
    if (editMode) return "tol-edit-mode";
    return "";
  }

  // returns the first view at the moment
  return (
    <div className={`tol-board ${classMode()}`} >
      {BoardBar}
      <div className="tol-views">
        {board.order?.map((viewId) => {
          const view = board.views?.[viewId];
          if (view) {
            return (
              <View
                key={view.id}
                id={view.id!}
                boardDataSource={boardDataSource}
                actionsDataSource={actionsDataSource}
              />
            );
          }
        })}
      </div>
    </div >
  );
}
