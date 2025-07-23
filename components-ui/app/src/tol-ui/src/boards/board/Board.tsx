/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/


import { useEffect, useState, useContext } from "react";
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
  getUserRole,
  PrivelegeContext,
  copyToClipboard,
  PopUpMessage,
  IUtilityBar
} from "../..";


export interface PBoard {
  dataSource: TsDataSource;
  boardDataSource: TsDataSource;
  setPrivelege: (privelege: string) => void;
}

export function Board(props: PBoard) {
  const {
    dataSource,
    boardDataSource,
    setPrivelege
  } = props;

  const { boardId, viewId } = useParams<any>();
  const [user, setUser] = useState<any>(null);
  const [boardData, setBoardData] = useState<any>({});
  const [view, setView] = useState(viewId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const privelege = useContext(PrivelegeContext);

  themeListener(() => {
    try {
      const backing = document.getElementById("tol-app-background");
      backing!.style.backgroundColor = getCssVarValue("--tol-bg-dark");
    } catch {
      return;
    }
  });

  useEffect(() => {
    const u = getUserFromLocalStorage();
    if (u) setUser(u);

    const awaitUserRole = async () => {
      const userRole = await getUserRole(u, boardDataSource!, boardId)
      setPrivelege(userRole);
    };
    awaitUserRole();
  }, []);

  useEffect(() => {
    if (boardId && user) {
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

  if (error !== "" || privelege === "hidden") {
    return <Redirect to="/page-not-found" />;
  }

  if (loading) {
    return <LoadingContent text="Finding Board..." />;
  }

  const UtilityBarConfig: IUtilityBar = {
    id: "board-utility-bar",
    buttons: [
      {
        position: "right",
        type: "primary",
        icon: "share-from-square",
        onClick: () => {
          copyToClipboard(location.href);
          PopUpMessage({
            type: 'success',
            message: 'Board link copied to clipboard',
          });
        },
      }
    ],
    title: {
      text: boardData.boardTitle,
      editable: privelege === "editable",
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
        dataSource={dataSource}
        boardDataSource={boardDataSource}
        utilityBarConfig={UtilityBarConfig}
      />
    </div>
  );
}
