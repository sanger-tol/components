/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import { Redirect, useParams } from "react-router-dom";
import {
  BOARDS,
  getBoard,
  getCssVarValue,
  getUserFromLocalStorage,
  LoadingContent,
  saveTitle,
  themeListener,
  TsDataSource,
  View,
  getUserPrivilege,
  useBoard,
  copyToClipboard,
  TBoardPrivilege,
  PRIVILEGE,
  TNavBrand,
  BUTTONS,
  UtilityBar,
  PButton,
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
  actionsDataSource: TsDataSource;
  /**
   * The brand to display in the loading screen.
   */
  brand?: TNavBrand;
}

/**
 * Component to render a board based on its ID and TSDataSource.
 */
export function Board(props: PBoard) {
  const { boardDataSource, actionsDataSource, brand } = props;

  const { privilege, setPrivilege, editMode, setEditMode, layoutMode, setLayoutMode } = useBoard();

  const { boardId: paramBoardId, viewId } = useParams<any>();
  const [user, setUser] = useState<any>(null);
  const [boardData, setBoardData] = useState<any>({});
  const [title, setTitle] = useState("");
  const [view, setView] = useState(viewId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Ability to override boardId from props over URL params
  const boardId = props.boardId ?? paramBoardId;

  themeListener(() => {
    try {
      const backing = document.getElementById("tol-smart-app-background");
      backing!.style.backgroundColor = getCssVarValue("--tol-bg-dark");
    } catch {
      return;
    }
  });

  useEffect(() => {
    const u = getUserFromLocalStorage();
    if (u) setUser(u);

    const awaitUserPrivilege = async () => {
      const userPrivilege: TBoardPrivilege = await getUserPrivilege(u, boardDataSource!, boardId)
      setPrivilege(userPrivilege);
    };
    awaitUserPrivilege();
  }, []);

  useEffect(() => {
    if (boardId) {
      getBoard(boardId, boardDataSource!)
        .then((data: any) => {
          if (!view) setView(data.views[0].id);
          setBoardData(data);
          setTitle(data.boardTitle);
        })
        .catch((e: any) => {
          setError(e);
          console.error(e);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [boardId, user]);

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

  const onLayoutModeToggle = () => {
    setLayoutMode(!layoutMode);
  };

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
    text: title,
    editable: editMode,
    onSave: (value: string) => {
      saveTitle(value, boardId, boardDataSource, BOARDS.BOARD);
      setTitle(value);
    }
  } : undefined;

  // Large header for view mode
  const viewModeTitle = !editMode ? [(
    <h3>
      {title}
    </h3>
  )] : undefined;

  const Bar = (
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
    </div>
  )

  const classMode = () => {
    if (editMode) return "tol-edit-mode";
    return "";
  }

  // returns the first view at the moment
  return (
    <div className={`tol-board ${classMode()}`} >
      {Bar}
      < View
        id={boardData.views[0].id}
        defaultFilter={boardData.views[0].filter}
        boardDataSource={boardDataSource}
        actionsDataSource={actionsDataSource}
      />
    </div >
  );
}
