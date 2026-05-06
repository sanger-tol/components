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
    tableLoading,
    layoutMode,
    setLayoutMode,
    board,
    setBoard,
  } = useBoard();

  const { boardId: paramBoardId } = useParams<any>();
  const [boardCopyModalOpen, setBoardCopyModalOpen] = useState<boolean>(false);
  const [newBoardCopyTitle, setNewBoardCopyTitle] = useState<string>("");

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
    if (boardData && isSuccess) {
      setBoard(boardData as IBoard);
      setPrivilege(
        boardData.write_privilege
          ? PRIVILEGE.BOARD.WRITABLE
          : PRIVILEGE.BOARD.VIEWABLE,
      );
    }
  }, [isSuccess]);

  if (isError) {
    return <Redirect to={URL_PATHS.PAGE_NOT_FOUND} />;
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

  const LayoutOrExitButton: PButton = {
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

  const EditOrExitButton: PButton = {
    ...editOrExitLogic,
    visible: privilege === PRIVILEGE.BOARD.WRITABLE && !layoutMode,
    disabled: editMode && tableLoading,
    onClick: () => {
      setEditMode(!editMode);
    },
    testid: `board-${editMode ? "exit" : "enter"}-edit-mode-button`,
    tooltip: editMode && tableLoading ? "Please wait for the table to load before exiting edit mode." : "",
  };

  const ShareButton: PButton = {
    ...BUTTONS.SHARE,
    onClick: () => {
      copyToClipboard(location.href);
    },
  };

  const CopyButton: PButton = {
    ...BUTTONS.COPY,
    onClick: () => {
      if(!newBoardCopyTitle.trim()) {
        setNewBoardCopyTitle(`${board?.title} - copy`);
      }
      setBoardCopyModalOpen(true);
    },
    tooltip: "Copy Board",
  };

  // Different format used for the main Board title
  const EditModeTitle = editMode
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
        buttons={[
          EditOrExitButton,
          LayoutOrExitButton,
          ...(!editMode ? [ShareButton, CopyButton] : []),
        ]}
        title={EditModeTitle}
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
              message: BOARD_MESSAGE_TEXT(BOARDS.BOARD).BOARD_COPY.NO_TITLE_ERROR,
            });
            return;
          }
          await copyBoardEntity(
            boardDataSource,
            id!,
            API_UTILITY_OPERATIONS.BOARD_COPY,
            BOARDS.BOARD,
            setBoard,
            newBoardCopyTitle,
          );
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
      {Bar}
      {board?.order?.[0] && (
        <View
          key={board?.order?.[0]}
          id={board?.order?.[0]}
          boardDataSource={boardDataSource}
          actionsDataSource={actionsDataSource}
        />
      )}
    </div>
  );
}
