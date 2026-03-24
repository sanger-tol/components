/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import { Input, DatePicker } from "rsuite";
import { Button, BUTTONS, PCellDisplay } from "../..";
import { isValidDate } from "./utils";

export interface PCellEditable extends PCellDisplay {
  loading: boolean;
  floatingControls?: boolean;
  onChange: (newValue: string | Date) => void;
  onCancel: () => void;
  onSave: () => void;
}

export function CellEditable(props: PCellEditable) {
  const { value, loading, floatingControls, onChange, onCancel, onSave } =
    props;

  const [datePickerOpen, setDatePickerOpen] = useState(true);

  const valueIsValidDate = isValidDate(value);

  return (
    <>
      {valueIsValidDate ? (
        <DatePicker
          value={new Date(value)}
          onChange={(date) => {
            if (!date) return;
            onChange(date);
            setDatePickerOpen(false);
          }}
          cleanable={false}
          preventOverflow
          oneTap
          block
          open={datePickerOpen}
          onOpen={() => setDatePickerOpen(true)}
          onClose={() => setDatePickerOpen(false)}
          editable={false}
        />
      ) : (
        <Input
          autoFocus
          value={value}
          onChange={onChange}
          onPressEnter={onSave}
        />
      )}
      <div
        className={`tol-data-point-editable-controls${floatingControls ? " floating" : ""}`}
      >
        <Button {...BUTTONS.CANCEL} disabled={loading} onClick={onCancel} />
        <Button
          {...BUTTONS.SAVE}
          disabled={loading}
          loading={loading}
          onClick={onSave}
        />
      </div>
    </>
  );
}
