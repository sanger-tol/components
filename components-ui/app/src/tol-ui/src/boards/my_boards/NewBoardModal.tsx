/*
 * SPDX-FileCopyrightText: 2025 Genome Research Ltd.
 *
 * SPDX-License-Identifier: MIT
 */

import { useEffect, useState } from "react";
import Modal from "../../general/Modal";
import { generateId } from "../../general/Utils";
import { FormTextField } from "../../forms";
import { RSForm, Button } from "../../index";

interface Props {
  setOpen: any;
  open: any;
  onConfirmClick?: any;
}

function NewBoardModal(props: Props) {
  const { setOpen, open, onConfirmClick } = props;
  const [boardId, setBoardId] = useState("");
  const [viewId, setViewId] = useState("");
  const [boardTitle, setBoardTitle] = useState("");
  // @ts-ignore
  const [viewTitle, setViewTitle] = useState("");

  useEffect(() => {
    setBoardId(generateId("b"));
    setViewId(generateId("v"));
  }, []);

  const actionButtons = (
    <div>
      <Button
        position="right"
        type="success"
        disabled={boardTitle === "" /*|| viewTitle === ""*/} // Views will be 'View 1' for now
        onClick={() => {
          setOpen(false),
            onConfirmClick(boardId, viewId, boardTitle, viewTitle);
        }}
        text="Create"
        icon="plus"
      />
      <Button
        position="right"
        type="error"
        onClick={() => setOpen(false)}
        text="Cancel"
        icon="xmark"
      />
    </div>
  );

  const header = (
    <div>
      <h4>Create New Board</h4>
    </div>
  );

  const body = (
    <RSForm fluid>
      <FormTextField
        id="board-title"
        value={boardTitle}
        onChange={(value: any) => setBoardTitle(value)}
        name="Board Title"
        placeholder={`Id: ${boardId}`}
        label="Create a title for your board:"
      />
      {/* 
        <FormTextField
          id="board-title"
          value={viewTitle}
          onChange={(value: any) => setViewTitle(value)}
          name="View Title"
          placeholder={`Id: ${viewId}`}
          label="Create a title for your first board view:"
        />
        */}
    </RSForm>
  );

  return (
    <div className="confirm-delete-buttons">
      <Modal
        setOpen={setOpen}
        open={open}
        size={"xs"}
        children={body}
        closeButton={false}
        header={header}
        actionButton={actionButtons}
      />
    </div>
  );
}

export default NewBoardModal;
