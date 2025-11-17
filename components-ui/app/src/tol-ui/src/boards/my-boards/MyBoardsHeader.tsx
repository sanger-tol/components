/*
 * SPDX-FileCopyrightText: 2024 Genome Research Ltd.
 *
 * SPDX-License-Identifier: MIT
 */

import { useState } from "react";
import { useHistory } from "react-router-dom";
import {
  NewBoardModal,
  createBoardAndView,
  BOARDS,
  Button,
  PBoard,
} from "../..";


export function MyBoardsHeader(props: PBoard) {
  const { boardDataSource } = props;
  const [newBoardModalOpen, setNewBoardModalOpen] = useState(false);
  const [modalError, setModalError] = useState("");
  const history = useHistory();

  const TITLE = "My Boards";
  const SUB_TITLE = (
    `Here you can view and delete your boards, 
    along with viewing board hierarchy and components 
    of each zone.`
  );

  const handleNewBoardCreate = async (
    boardId: string,
    viewId: string,
    boardTitle: string,
    viewTitle: string,
  ) => {
    await createBoardAndView(
      boardDataSource,
      boardId,
      boardTitle,
      viewId,
      viewTitle
    ).catch((error) => {
      console.error("Error creating board and view:", error);
      setModalError("Failed to create board, please try again.");
    }).finally(() => {
      if (modalError === "") {
        setTimeout(() => {
          history.push(`/${BOARDS.BOARD}/${boardId}`);
        }, 800);
      }
    });
  };

  const NewBoardModalContent = () => (
    <NewBoardModal
      setOpen={setNewBoardModalOpen}
      open={newBoardModalOpen}
      onConfirmClick={handleNewBoardCreate}
    />
  );

  return (
    <div className="my-boards-header">
      <div className="my-boards-buttons" style={newBoardModalOpen ? { display: "none" } : {}}>
        <Button
          id="create-new-board-button"
          testid="create-new-board-button"
          icon="plus"
          text="New Board"
          type="success"
          onClick={() => setNewBoardModalOpen(true)}
        />
      </div>
      <h1>{TITLE}</h1>
      <p>{SUB_TITLE}</p>
      {newBoardModalOpen && NewBoardModalContent()}
    </div>
  );
}
