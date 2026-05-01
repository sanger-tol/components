/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect } from "react";
import { Redirect, useParams } from "react-router-dom";
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
} from "../..";
import type { IBoard, PButton, TNavBrand, TsDataSource } from "../..";

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
    layoutMode,
    setLayoutMode,
    board,
    setBoard,
  } = useBoard();

  const { boardId: paramBoardId } = useParams<any>();

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
    () => getBoardEntityAndChildren(boardDataSource, id, "board"),
    { enabled: !!id },
  );

  useEffect(() => {
    if (boardData && isSuccess) {
      console.log("setting board!!")
      setBoard(boardData as IBoard);
      setPrivilege(
        boardData.write_privilege
          ? PRIVILEGE.BOARD.WRITABLE
          : PRIVILEGE.BOARD.VIEWABLE,
      );
    }
  }, [isSuccess]);

  useEffect(() => {
    console.log(board);
  }, [board])

  if (isError) {
    return <Redirect to="/page-not-found" />;
  }

  if (!isSuccess && !boardData && !board) {
    return <LoadingContent overlayNav brand={brand} text="Finding Board..." />;
  }

  const onLayoutModeToggle = () => {
    setLayoutMode(!layoutMode);
  };

  const layoutOrExitLogic: PButton = layoutMode
    ? {
        ...BUTTONS.SAVE,
        text: "Save Layouts",
      }
    : {
        ...BUTTONS.EDIT,
        text: "Change Layout",
      };

  const layoutOrExitButton: PButton = {
    ...layoutOrExitLogic,
    visible: privilege === PRIVILEGE.BOARD.WRITABLE && editMode,
    onClick: onLayoutModeToggle,
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

  const editOrExitButton: PButton = {
    ...editOrExitLogic,
    visible: privilege === PRIVILEGE.BOARD.WRITABLE && !layoutMode,
    onClick: () => {
      setEditMode(!editMode);
    },
    testid: `board-${editMode ? "exit" : "enter"}-edit-mode-button`,
    tooltip: "",
  };

  const shareButton: PButton = {
    ...BUTTONS.SHARE,
    onClick: () => {
      copyToClipboard(location.href);
    },
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
      }
    : undefined;

  // Large header for view mode
  const viewModeTitle = !editMode ? [<h3>{board?.title}</h3>] : undefined;

  const Bar = (
    <div className="tol-board-bar">
      <UtilityBar
        id="board-utility-bar"
        buttons={[editOrExitButton, layoutOrExitButton, shareButton]}
        title={editModeTitle}
        elements={viewModeTitle}
      />
    </div>
  );

  const classMode = () => {
    if (editMode) return "tol-edit-mode";
    return "";
  };

  // returns the first view at the moment
  return (
    <div className={`tol-board ${classMode()}`}>
      {Bar}
      {board?.order?.[0] && (
        <View
          id={board?.order?.[0]}
          boardDataSource={boardDataSource}
          actionsDataSource={actionsDataSource}
        />
      )}
    </div>
  );
}
