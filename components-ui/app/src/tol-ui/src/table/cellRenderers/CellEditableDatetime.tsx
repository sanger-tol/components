/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import { DatePicker } from "rsuite";
import { Button, BUTTONS, PCellDisplay } from "../..";

export function CellEditableDatetime(props: PCellEditable) {
  const { value, loading, floatingControls, onChange, onCancel, onSave } = props;

  const [datePickerOpen, setDatePickerOpen] = useState(true);

  return (
    <>
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
