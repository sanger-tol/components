/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  TsDataSource,
  LoadingContent,
  InlineEdit,
  themeListener,
} from "../../index";
import View from "../view/View";
import { getBoard, saveTitle } from "../utils";
import { useEffect, useState } from "react";
import { Redirect, useParams } from "react-router-dom";
import { getUserFromLocalStorage } from "../../services/localStorage/localStorageService";
import { getCssVarValue } from "../../general/utils";
import { BOARDS, BOARDS_API_PREFIX } from "../../constants";

interface Props {
  dataSource: TsDataSource;
  boardDataSource?: TsDataSource;
}

export function Board(props: Props) {
  const {
    dataSource,
    boardDataSource = new TsDataSource({
      apiPrefix: BOARDS_API_PREFIX,
    })
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
      getBoard(boardId, boardDataSource)
        .then((res: any) => {
          if (!view) setView(res.views[0].id);
          setBoardData(res);
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
          title={boardData.boardTitle}
          onSave={(newTitle: any) => {
            if (newTitle !== boardData.boardTitle) {
              saveTitle(newTitle, boardDataSource, boardId, BOARDS.BOARD);
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
