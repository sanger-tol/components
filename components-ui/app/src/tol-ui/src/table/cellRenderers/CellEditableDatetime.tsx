/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import { DatePicker } from "rsuite";
import { CellEditableControls, PCellEditableInput, PopUpMessage } from "../..";


export function CellEditableDatetime(props: PCellEditableInput) {
  const {
    field,
    value,
    setValue,
    onSaveSuccess,
    onSaveError,
    dataSource,
    dataObject,
    loading,
    setLoading,
    floatingControls,
    onCancel
  } = props;

  const [datePickerOpen, setDatePickerOpen] = useState(true);

  const onChange = (newValue: string) => {
    setValue(newValue);
  }

  const onSave = () => {
    // prevent saving blank values
    if (typeof value === "string" && value.trim() === "") {
      PopUpMessage({
        type: "error",
        message: "Value cannot be blank.",
      });
      return;
    }

    if (!dataObject) return;
    setLoading(true);
    dataSource
      ?.upsert({
        objectType: dataObject?.objectType,
        payload: [
          {
            type: dataObject?.objectType,
            id: dataObject?.id,
            attributes: {
              [field]: value,
            },
          },
        ],
      })
      .then(() => onSaveSuccess?.())
      .catch(() => onSaveError?.())
      .finally(() => setLoading(false));
  }

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
      <CellEditableControls
        floatingControls={floatingControls}
        loading={loading}
        onCancel={onCancel}
        onSave={onSave}
      />
    </>
  );
}
