/*
 * SPDX-FileCopyrightText: 2024 Genome Research Ltd.
 *
 * SPDX-License-Identifier: MIT
 */

import { useHistory } from "react-router-dom";
import {
  createBoardAndView,
  BOARDS,
  Button,
  PBoard,
  MY_BOARDS_TITLE,
  MY_BOARDS_SUB_TITLE,
  useAuth,
} from "../..";
import { useState } from "react";


export function MyBoardsHeader(props: PBoard) {
  const { boardDataSource } = props;

  const { user } = useAuth();
  const history = useHistory();
  const [loading, setLoading] = useState(false);

  const create = () => {
    setLoading(true);
    createBoardAndView(
      boardDataSource,
      user!
    ).then((boardId) => {
      if (boardId) {
        setTimeout(() => {
          history.push(`/${BOARDS.BOARD}/${boardId}`);
        }, 500);
      }
    }).catch(() => {
      setLoading(false);
    });
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
          onClick={create}
          loading={loading}
          disabled={loading}
        />
      </div>
      <h1>{MY_BOARDS_TITLE}</h1>
      <p>{MY_BOARDS_SUB_TITLE}</p>
    </div>
  );
}
