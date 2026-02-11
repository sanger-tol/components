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
  useBoardPrivilege,
  copyToClipboard,
  PUtilityBar,
  TBoardPrivilege,
  PRIVILEGE
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
}

/**
 * Component to render a board based on its ID and TSDataSource.
 */
export function Board(props: PBoard) {
  const { boardDataSource } = props;

  const { boardId: paramBoardId, viewId } = useParams<any>();
  const [user, setUser] = useState<any>(null);
  const [boardData, setBoardData] = useState<any>({});
  const [view, setView] = useState(viewId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { privilege, setPrivilege } = useBoardPrivilege();

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
          setLoading(false);
        })
        .catch((e: any) => {
          setError(e);
          console.error(e);
        });
    }
  }, [boardId, user]);

  if (error !== "") {
    return <Redirect to="/page-not-found" />;
  }

  if (loading) {
    return <LoadingContent text="Finding Board..." />;
  }

  const UtilityBarConfig: PUtilityBar = {
    id: "board-utility-bar",
    buttons: [
      {
        position: "right",
        type: "primary",
        icon: "share-from-square",
        onClick: () => {
          copyToClipboard(location.href);
        },
      }
    ],
    title: {
      text: boardData.boardTitle,
      editable: privilege === PRIVILEGE.BOARD.EDITABLE,
      onSave: (value: string) => {
        saveTitle(value, boardId, BOARDS.BOARD, boardDataSource);
      },
    },
  }

  // returns the first view at the moment
  return (
    <div className="tol-board">
      <View
        id={boardData.views[0].id}
        defaultFilter={boardData.views[0].filter}
        boardDataSource={boardDataSource}
        utilityBarConfig={UtilityBarConfig}
      />
    </div>
  );
}
