/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Input } from "rsuite";
import { Button, BUTTONS, PCellEditableInput } from "../..";


export function CellEditableText(props: PCellEditableInput) {
  const { value, loading, floatingControls, onCancel } = props;

  const onChange = (newValue: string | Date) => {
    setValue(newValue);
  }

  return (
    <>
      <Input
        autoFocus
        value={value}
        onChange={onChange}
        onPressEnter={onSave}
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
