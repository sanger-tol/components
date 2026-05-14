/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Input } from "rsuite";
import {
  BOARDS,
  Button,
  BUTTONS,
  copyView,
  Modal,
  PASTE_BUTTON,
  useBoard,
} from "../../../..";
import type { TsDataSource } from "../../../..";

export interface IImportViewModalProps {
  open: boolean;
  onClose: () => void;
  boardDataSource: TsDataSource;
  viewImportId: string;
  setViewImportId: (id: string) => void;
  setActiveViewId: (id: string | null) => void;
  newViewTitle: string;
}

export function ImportViewModal(props: IImportViewModalProps) {
  const {
    open,
    onClose,
    boardDataSource,
    viewImportId,
    setViewImportId,
    setActiveViewId,
    newViewTitle,
  } = props;

  const { board, setBoard } = useBoard();

  const onViewImport = async () => {
    const result = await copyView(
      boardDataSource,
      viewImportId,
      BOARDS.BOARD,
      newViewTitle,
      BOARDS.VIEW,
      board,
      board?.id,
    );
    if (result) {
      setBoard(result.updatedBoard);
      setActiveViewId(result.view.id ?? null);
    }
    onClose();
  };

  const checkViewIdValidity = (id: string): boolean => {
    return id.includes("v_") && id.length === 14;
  };

  return (
    <Modal
      open={open}
      setOpen={(isOpen) => { if (!isOpen) onClose(); }}
      size={"sm"}
      actionButtonInline
      children={
        <>
          <h3>Import View</h3>
          <p style={{ marginBottom: "4px" }}>
            Import a view from another board using its View ID:
          </p>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Input
              placeholder={"Enter or paste view ID..."}
              value={viewImportId}
              onChange={(value: string) => setViewImportId(value)}
            />
            <Button {...PASTE_BUTTON((text) => setViewImportId(text))} />
          </div>
        </>
      }
      actionButton={
        <Button
          {...BUTTONS.CONFIRM}
          onClick={async () => await onViewImport()}
          disabledTooltip="Please ensure the entered id is a valid view ID."
          disabled={!checkViewIdValidity(viewImportId)}
        />
      }
    />
  );
}
