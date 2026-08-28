/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import { CellEditableDatetime, CellEditableStatus, CellEditableText, PCellDisplay, PopUpMessage } from "../..";

export interface PCellEditable extends PCellDisplay {
  floatingControls?: boolean;
  setValue: (newValue: any) => void;
  onCancel: () => void;
}

export interface PCellEditableInput extends PCellEditable {
  onSaveSuccess?: () => void;
  onSaveError?: () => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export function CellEditable(props: PCellEditable) {
  const { value, setValue, onCancel } = props;
  const { type, actsAs } = props.meta;

  const [loading, setLoading] = useState(false);
  const [prevValue, setPrevValue] = useState(value);

  const onCompleteEdit = () => {
    setLoading(false);
    onCancel();
  }

  const onSaveSuccess = () => {
    onCompleteEdit();
    setPrevValue(value);
    PopUpMessage({
      type: "success",
      message: "Value saved successfully.",
    });
  }

  const onSaveError = () => {
    onCompleteEdit();
    // revert to previous value on error
    setValue(prevValue);
    PopUpMessage({
      type: "error",
      message: `Error saving value. Please try again.`,
    });
  }

  const newProps = {
    ...props,
    onSaveSuccess,
    onSaveError,
    loading,
    setLoading,
  }

  let InputType = CellEditableText;
  if (type === "datetime") InputType = CellEditableDatetime;
  if (actsAs === "status") InputType = CellEditableStatus;

  return <InputType {...newProps} />;
}