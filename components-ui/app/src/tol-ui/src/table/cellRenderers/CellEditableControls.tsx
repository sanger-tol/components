/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Button, BUTTONS } from "../..";

/**
 * Props for the action controls shown beneath an inline editable cell.
 */
export interface PCellEditableControls {
  /** Whether the controls should float below the cell content. */
  floatingControls?: boolean;
  /** Whether the save action is currently awaiting an async update. */
  loading: boolean;
  /** Whether the save action should be disabled. */
  saveDisabled?: boolean;
  /** Cancels the inline edit and restores the previous value. */
  onCancel: () => void;
  /** Persists the current edited value. */
  onSave: () => void;
}

/**
 * Action buttons for saving or cancelling an inline cell edit.
 */
export function CellEditableControls(props: PCellEditableControls) {
  const {
    floatingControls,
    loading,
    saveDisabled = false,
    onCancel,
    onSave,
  } = props;

  return (
    <div
      className={`tol-data-point-editable-controls${floatingControls ? " floating" : ""}`}
    >
      <Button {...BUTTONS.CANCEL} disabled={loading} onClick={onCancel} />
      <Button
        {...BUTTONS.SAVE}
        disabled={loading || saveDisabled}
        loading={loading}
        onClick={onSave}
      />
    </div>
  );
}
