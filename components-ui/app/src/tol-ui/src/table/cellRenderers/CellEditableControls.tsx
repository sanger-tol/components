/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Button, BUTTONS } from "../..";

export interface PCellEditableControls {
  loading: boolean;
  floatingControls?: boolean;
  saveDisabled?: boolean;
  onCancel: () => void;
  onSave: () => void;
}

export function CellEditableControls(props: PCellEditableControls) {
  const { loading, floatingControls, saveDisabled, onCancel, onSave } = props;

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
