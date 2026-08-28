/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import {
  CellEditableDatetime,
  CellEditableStatus,
  CellEditableText,
  MESSAGE_TYPE,
  PCellDisplay,
  PopUpMessage,
  VALUE_ERROR_MESSAGE,
  VALUE_SAVED_SUCCESSFULLY_MESSAGE,
} from "../..";


/**
 * Props for the wrapper that chooses the correct inline editor for a cell.
 */
export interface PCellEditable extends PCellDisplay {
  /** Whether the edit controls should float below the cell content. */
  floatingControls?: boolean;
  /** Updates the value in the parent component when the inline editor changes. */
  setValue: (newValue: any) => void;
  /** Runs when the inline editor closes after cancel or save. */
  onExit: () => void;
}

/**
 * Props for the concrete inline editor used by the cell wrapper.
 */
export interface PCellEditableInput extends PCellEditable {
  /** Called after a successful save. */
  onSaveSuccess?: () => void;
  /** Called when the save operation fails. */
  onSaveError?: () => void;
  /** Reverts the editor state and exits without persisting changes. */
  onCancel: () => void;
  /** Whether the editor is waiting on an async save or fetch. */
  loading: boolean;
  /** Toggles the loading state for the current edit action. */
  setLoading: (loading: boolean) => void;
}

/**
 * Renders the correct inline editor for the cell based on field type metadata.
 */
export function CellEditable(props: PCellEditable) {
  const { value, setValue, onExit, meta } = props;
  const { type, actsAs } = meta;

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
      type: MESSAGE_TYPE.SUCCESS,
      message: VALUE_SAVED_SUCCESSFULLY_MESSAGE,
    });
  }

  const onSaveError = () => {
    onCancel();
    // revert to previous value on error
    setValue(prevValue);
    PopUpMessage({
      type: MESSAGE_TYPE.ERROR,
      message: VALUE_ERROR_MESSAGE,
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