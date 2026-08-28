/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import { CellEditableDatetime, CellEditableStatus, CellEditableText, PCellDisplay } from "../..";

export interface PCellEditable extends PCellDisplay {
  floatingControls?: boolean;
  setValue: (newValue: any) => void;
  onCancel: () => void;
  onSaveSuccess?: () => void;
  onSaveError?: () => void;
}

export interface PCellEditableInput extends PCellEditable {
  prevValue: any;
  setPrevValue: (newValue: any) => void;
  loading: boolean;
  setLoading: (newValue: boolean) => void;
}

export function CellEditable(props: PCellEditable) {
  const { value } = props;
  const { type, actsAs } = props.meta;

  const [loading, setLoading] = useState(false);
  const [prevValue, setPrevValue] = useState(value);

  const states = {
    loading,
    setLoading,
    prevValue,
    setPrevValue,
  }

  let Element = CellEditableText;
  if (type === "datetime") Element = CellEditableDatetime;
  if (actsAs === "status") Element = CellEditableStatus;

  return <Element {...props} {...states} />;
}