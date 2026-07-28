/*
 * SPDX-FileCopyrightText: 2024 Genome Research Ltd.
 *
 * SPDX-License-Identifier: MIT
 */

import { useHistory } from "react-router-dom";
import {
  BOARD_ENTITIES,
  BOARDS_API,
  Button,
  PBoard,
  MY_BOARDS_TITLE,
  MY_BOARDS_SUB_TITLE,
  API_METHODS,
  PopUpMessage,
  BOARD_MESSAGE_TEXT,
} from "../..";
import { useState } from "react";

export function MyBoardsHeader(props: PBoard) {
  const { boardDataSource } = props;

  const history = useHistory();
  const [loading, setLoading] = useState(false);

  const createBoard = () => {
    boardDataSource
      .custom({
        method: API_METHODS.POST,
        resource: BOARDS_API.OPERATIONS.CREATE_BOARD,
        body: {}
      })
      .then((res) => {
        const { id } = res.data;
        setTimeout(() => {
          history.push(`/${BOARD_ENTITIES.ENTITIES.BOARD}/${id}`);
        }, 500);
      })
      .catch(() => {
        setLoading(false);
        PopUpMessage({
          type: "error",
          message: BOARD_MESSAGE_TEXT(BOARD_ENTITIES.ENTITIES.BOARD).CREATE.ERROR,
        });
      });
    setLoading(true);
  };

  return (
    <div className="my-boards-header">
      <div className="my-boards-buttons">
        <Button
          id="create-new-board-button"
          testid="create-new-board-button"
          icon="plus"
          text="New Board"
          type="success"
          onClick={createBoard}
          loading={loading}
          disabled={loading}
        />
      </div>
      <h1>{MY_BOARDS_TITLE}</h1>
      <p>{MY_BOARDS_SUB_TITLE}</p>
    </div>
  );
}
