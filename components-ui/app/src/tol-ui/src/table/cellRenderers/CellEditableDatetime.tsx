/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import { DatePicker } from "rsuite";
import { Button, BUTTONS, PCellEditableInput } from "../..";

export function CellEditableDatetime(props: PCellEditableInput) {
  const { value, loading, floatingControls, onCancel } = props;

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
