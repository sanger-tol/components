/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Input } from "rsuite";
import {
  Button,
  BUTTONS,
  PCell
} from "../..";


export interface PCellEditable extends PCell {
  loading: boolean;
  floatingControls?: boolean;
  onChange: (newValue: string) => void;
  onCancel: () => void;
  onSave: () => void;
}

export function CellEditable(props: PCellEditable) {
  const { value, loading, floatingControls, onChange, onCancel, onSave } = props;

  return (
    <>
      <Input
        autoFocus
        value={value}
        onChange={onChange}
        onPressEnter={onSave}
      />
      <div
        className={`tol-cell-editable-controls${floatingControls ? " floating" : ""}`}
      >
        <Button
          {...BUTTONS.CANCEL}
          disabled={loading}
          onClick={onCancel}
        />
        <Button
          {...BUTTONS.SAVE}
          disabled={loading}
          loading={loading}
          onClick={onSave}
        />
      </div>
    </>
  )
}