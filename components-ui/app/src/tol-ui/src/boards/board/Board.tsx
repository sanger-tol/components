/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import { Redirect, useParams, useHistory } from "react-router-dom";
import { Input } from "rsuite";
import {
  BOARDS,
  getBoard,
  getCssVarValue,
  getUserFromLocalStorage,
  LoadingContent,
  saveTitle,
  themeListener,
  View,
  getUserPrivilege,
  useBoard,
  copyToClipboard,
  PRIVILEGE,
  BUTTONS,
  UtilityBar,
  PopUpMessage,
  Modal,
  Button,
  API_METHODS,
  HTTP_STATUS_CODES,
  UTILITY_OPERATIONS,
  MESSAGE_TEXT,
  MESSAGE_TYPE,
} from "../..";
import type { TsDataSource, TBoardPrivilege, TNavBrand, PButton, IUser } from "../..";

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
  const { boardDataSource, actionsDataSource, brand } = props;

  const {
    privilege,
    setPrivilege,
    editMode,
    setEditMode,
    layoutMode,
    setLayoutMode,
  } = useBoard();
  const history = useHistory();

  const { boardId: paramBoardId, viewId } = useParams<{
    boardId: string;
    viewId: string;
  }>();

  const [user, setUser] = useState<IUser | null>(null);
  const [boardData, setBoardData] = useState<any>({});
  const [title, setTitle] = useState<string>("");
  const [view, setView] = useState<string>(viewId);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [boardCopyModalOpen, setBoardCopyModalOpen] = useState<boolean>(false);
  const [newBoardTitle, setNewBoardTitle] = useState<string>("");

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
    const user: IUser = getUserFromLocalStorage();
    if (user) setUser(user);

    const awaitUserPrivilege = async () => {
      const userPrivilege: TBoardPrivilege = await getUserPrivilege(
        user,
        boardDataSource!,
        boardId,
      );
      setPrivilege(userPrivilege);
    };
    awaitUserPrivilege();
  }, []);

  useEffect(() => {
    if (boardId) {
      setLoading(true);
      getBoard(boardId, boardDataSource!)
        .then((data: any) => {
          if (!view) setView(data.views[0].id);
          setBoardData(data);
          setTitle(data.boardTitle);
          setNewBoardTitle(`${data.boardTitle} - copy`);
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

  const userCopyEntireBoard = async (newBoardTitle: string) => {
    const newBoardId = await boardDataSource.custom({
      method: API_METHODS.POST,
      resource: `${UTILITY_OPERATIONS.BOARD_COPY}/${boardId}`,
      body: {
        board_title: newBoardTitle,
      },
    });

    if (newBoardId.status === HTTP_STATUS_CODES.CREATED) {
      PopUpMessage({
        type: MESSAGE_TYPE.SUCCESS,
        message: MESSAGE_TEXT.BOARD_COPY.SUCCESS,
      });
      history.push(`/board/${newBoardId.data.board_id}`);
    } else {
      PopUpMessage({
        type: MESSAGE_TYPE.ERROR,
        message: MESSAGE_TEXT.BOARD_COPY.ERROR,
      });
    }
  };

  if (error !== "") {
    return <Redirect to="/page-not-found" />;
  }

  if (loading) {
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
    visible: privilege === PRIVILEGE.BOARD.EDITABLE && editMode,
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
    visible: privilege === PRIVILEGE.BOARD.EDITABLE && !layoutMode,
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

  const copyButton: PButton = {
    ...BUTTONS.COPY,
    onClick: () => {
      setBoardCopyModalOpen(true);
    },
    tooltip: "Copy Board",
  };

  const BoardCopyModal = (
    <Modal
      open={boardCopyModalOpen}
      setOpen={setBoardCopyModalOpen}
      size={"sm"}
      children={
        <div>
          <h2>Save a Copy of this Board</h2>
          <p>
            You are about to create your own copy of this board, would you like
            to rename the board before copying?
          </p>
          <Input
            value={newBoardTitle}
            placeholder="Enter new title"
            onChange={(value: string) => setNewBoardTitle(value)}
          />
        </div>
      }
      actionButtonInline
      onExited={() =>
        newBoardTitle.trim() === ""
          ? setNewBoardTitle(`${boardData.boardTitle} - copy`)
          : null
      }
      actionButton={
        <Button
          {...BUTTONS.CONFIRM}
          disabledTooltip={"Please enter a title before submitting."}
          disabled={newBoardTitle.trim() === ""}
          onClick={() => {
            if (newBoardTitle.trim() === "") {
              PopUpMessage({
                type: MESSAGE_TYPE.ERROR,
                message: MESSAGE_TEXT.BOARD_COPY.NO_TITLE_ERROR,
              });
              return;
            }
            userCopyEntireBoard(newBoardTitle);
            setBoardCopyModalOpen(false);
          }}
        />
      }
    />
  );

  // Different format used for the main Board title
  const editModeTitle = editMode
    ? {
        text: title,
        editable: editMode,
        onSave: (value: string) => {
          saveTitle(value, boardId, boardDataSource, BOARDS.BOARD);
          setTitle(value);
        },
      }
    : undefined;

  // Large header for view mode
  const viewModeTitle = !editMode ? [<h3>{title}</h3>] : undefined;

  const Bar = (
    <div className="tol-board-bar">
      <UtilityBar
        id="board-utility-bar"
        buttons={[
          editOrExitButton,
          layoutOrExitButton,
          shareButton,
          copyButton,
        ]}
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
      {BoardCopyModal}
      {Bar}
      <View
        key={boardId}
        id={boardData.views[0].id}
        defaultFilter={boardData.views[0].filter}
        boardDataSource={boardDataSource}
        actionsDataSource={actionsDataSource}
      />
    </div>
  );
}
