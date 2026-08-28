/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Input } from "rsuite";
import { CellEditableControls, PCellEditableInput, PopUpMessage } from "../..";


export function CellEditableText(props: PCellEditableInput) {
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
      <Input
        autoFocus
        value={value}
        onChange={onChange}
        onPressEnter={onSave}
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
