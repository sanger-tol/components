/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Input } from "rsuite";
import {
  BOARD_ENTITIES,
  Button,
  BUTTONS,
  copyView,
  Modal,
  useBoard,
} from "../../..";
import type { TsDataSource } from "../../..";


export interface PImportViewModal {
  /**
   * Whether the import modal is open.
   */
  open: boolean;
  /**
   * Callback to close the modal.
   */
  onClose: () => void;
  /**
   * DataSource for board operations.
   */
  boardDataSource: TsDataSource;
  /**
   * The view ID to import.
   */
  viewImportId: string;
  /**
   * Sets the view ID to import.
   */
  setViewImportId: (id: string) => void;
  /**
   * Sets the active view after import.
   */
  setActiveViewId: (id: string | null) => void;
}

/**
 * Modal for importing a view into the current board by View ID.
 */
export function ImportViewModal(props: PImportViewModal) {
  const {
    open,
    onClose,
    boardDataSource,
    viewImportId,
    setViewImportId,
    setActiveViewId,
  } = props;

  const { board, setBoard } = useBoard();

  const onViewImport = async () => {
    const result = await copyView(
      boardDataSource,
      viewImportId,
      BOARD_ENTITIES.ENTITIES.VIEW,
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
      size="sm"
      actionButtonInline
      children={
        <div className="tol-board-view-import-modal">
          <h3>Import View</h3>
          <div className="tol-import-paste-button" >
            <p className="tol-view-import-paragraph">
              Import a view from another board using its View ID:
            </p>
            <Button
              {...BUTTONS.PASTE}
              onClick={async () => {
                const text = await navigator.clipboard.readText();
                setViewImportId(text);
              }}
            />
          </div>
          <Input
            placeholder="Enter or paste view ID..."
            value={viewImportId}
            onChange={(value: string) => setViewImportId(value)}
          />
        </div>
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
