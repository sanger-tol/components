/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Input } from "rsuite";
import {
  CellEditableControls,
  MESSAGE_TYPE,
  PCellEditableInput,
  PopUpMessage,
  VALUE_CANNOT_BE_BLANK_MESSAGE,
} from "../..";


/**
 * Text editor used for inline value updates.
 */
export function CellEditableText(props: PCellEditableInput) {
  const {
    field,
    value,
    setValue,
    dataObject,
    dataSource,
    onSaveSuccess,
    onSaveError,
    floatingControls,
    onCancel,
    loading,
    setLoading,
  } = props;

  const onChange = (newValue: string) => {
    setValue(newValue);
  }

  const onSave = () => {
    // prevent saving blank values
    if (typeof value === "string" && value.trim() === "") {
      PopUpMessage({
        type: MESSAGE_TYPE.ERROR,
        message: VALUE_CANNOT_BE_BLANK_MESSAGE,
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
