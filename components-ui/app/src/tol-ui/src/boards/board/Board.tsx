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
  UtilityBar
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
   * The brand to display in the loading screen.
   */
  brand?: TNavBrand;
}

/**
 * Component to render a board based on its ID and TSDataSource.
 */
export function Board(props: PBoard) {
  const { boardDataSource, brand } = props;

  const { privilege, setPrivilege, editMode, setEditMode } = useBoard();

  const { boardId: paramBoardId, viewId } = useParams<any>();
  const [user, setUser] = useState<any>(null);
  const [boardData, setBoardData] = useState<any>({});
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

  const editOrExitButton = editMode ? {
    ...BUTTONS.CONFIRM,
    tooltip: "Exit Edit Mode",
  } : {
    ...BUTTONS.EDIT,
    tooltip: "Edit Board",
  };

  // Different format used for the main Board title
  const editModeTitle = editMode ? {
    text: boardData.boardTitle,
    editable: editMode,
    onSave: (value: string) => {
      saveTitle(value, boardId, BOARDS.BOARD, boardDataSource);
    }
  } : undefined;

  // Large header for view mode
  const viewModeTitle = !editMode ? [(
    <h3>
      {boardData.boardTitle}
    </h3>
  )] : undefined;

  const Bar = (
    <div className="tol-board-bar">
      <UtilityBar
        id="board-utility-bar"
        buttons={[
          {
            ...editOrExitButton,
            visible: privilege === PRIVILEGE.BOARD.EDITABLE,
            onClick: () => {
              setEditMode(!editMode);
            },
          },
          {
            ...BUTTONS.SHARE,
            onClick: () => {
              copyToClipboard(location.href);
            },
          },
        ]}
        title={editModeTitle}
        elements={viewModeTitle}
      />
    </div>
  )

  // returns the first view at the moment
  return (
    <div className={`tol-board ${editMode ? "tol-edit-mode" : ""}`} >
      {Bar}
      < View
        id={boardData.views[0].id}
        defaultFilter={boardData.views[0].filter}
        boardDataSource={boardDataSource}
      />
    </div >
  );
}
