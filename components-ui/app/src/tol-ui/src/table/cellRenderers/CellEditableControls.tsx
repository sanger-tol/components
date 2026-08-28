/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Button, BUTTONS } from "../..";

interface PCellEditableControls {
  floatingControls?: boolean;
  loading: boolean;
  saveDisabled?: boolean;
  onCancel: () => void;
  onSave: () => void;
}

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
