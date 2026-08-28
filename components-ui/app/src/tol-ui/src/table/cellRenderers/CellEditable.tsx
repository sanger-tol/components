/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import { CellEditableDatetime, CellEditableStatus, CellEditableText, PCellDisplay, PopUpMessage } from "../..";

export interface PCellEditable extends PCellDisplay {
  floatingControls?: boolean;
  setValue: (newValue: any) => void;
  onExit: () => void;
}

export interface PCellEditableInput extends PCellEditable {
  onSaveSuccess?: () => void;
  onSaveError?: () => void;
  onCancel: () => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export function CellEditable(props: PCellEditable) {
  const { value, setValue, onExit } = props;
  const { type, actsAs } = props.meta;

  const [loading, setLoading] = useState(false);
  const [prevValue, setPrevValue] = useState(value);

  const onCancel = () => {
    // revert to previous value on cancel
    setValue(prevValue);
    onExit();
  }

  const onSaveSuccess = () => {
    setLoading(false);
    setPrevValue(value);
    onExit();
    PopUpMessage({
      type: "success",
      message: "Value saved successfully.",
    });
  }

  const onSaveError = () => {
    onCancel();
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
    onCancel,
    loading,
    setLoading,
  }

  let InputType = CellEditableText;
  if (type === "datetime") InputType = CellEditableDatetime;
  if (actsAs === "status") InputType = CellEditableStatus;

  return <InputType {...newProps} />;
}