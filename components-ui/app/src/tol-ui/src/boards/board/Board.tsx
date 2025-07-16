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
  InlineEdit,
  LoadingContent,
  saveTitle,
  themeListener,
  TsDataSource,
  View,
} from "../..";


export interface PBoard {
  dataSource: TsDataSource;
  boardDataSource: TsDataSource;
}

export function Board(props: PBoard) {
  const {
    dataSource,
    boardDataSource,
  } = props;

  const { boardId, viewId } = useParams<any>();
  const [user, setUser] = useState<any>(null);
  const [boardData, setBoardData] = useState<any>({});
  const [view, setView] = useState(viewId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  if (error !== "") {
    return <Redirect to="/page-not-found" />;
  }

  if (loading) {
    return <LoadingContent text="Finding Board..." />;
  }

  // returns the first view at the moment
  return (
    <div className="tol-board">
      <div className="tol-board-bar">
        <InlineEdit
          text={boardData.boardTitle}
          onSave={(newTitle: any) => {
            if (newTitle !== boardData.boardTitle) {
              saveTitle(newTitle, boardId, BOARDS.BOARD, boardDataSource);
            }
          }}
          editable
        />
      </div>
      <View
        id={boardData.views[0].id}
        defaultFilter={boardData.views[0].filter}
        dataSource={dataSource}
        boardDataSource={boardDataSource}
      />
    </div>
  );
}
