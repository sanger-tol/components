/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import {
  CellDisplay,
  PopUpMessage,
  CellEditable,
  getFieldByName,
} from "../..";
import { PDataPoints } from "./DataPoints";


/**
 * Singular data point renderer. Used within DataPoints to render each individual data point.
 * Can take a renderer to allow for custom rendering of the data point.
 */
export function DataPoint(props: PDataPoints) {
  const { field, dataObject, dataSource, editable } = props;

  const v = getFieldByName(dataObject, field);

  const [value, setValue] = useState(v);
  const [prevValue, setPrevValue] = useState(v);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const canEdit = (
    typeof value === "string"
  );

  const onDoubleClick = () => {
    if (!editable) return;
    if (canEdit) {
      setEditMode(true);
    } else {
      PopUpMessage({
        type: "info",
        message: "Only string values are editable currently.",
      })
    }
  }

  const onChange = (newValue: string) => {
    setValue(newValue);
  }

  const onCancel = () => {
    setEditMode(false);
    setValue(prevValue);
  };

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
              [props.field]: value,
            },
          },
        ],
      })
      .then(() => {
        setEditMode(false);
        setPrevValue(value);
        PopUpMessage({
          type: "success",
          message: "Value saved successfully.",
        });
      })
      .catch((error: any) => {
        PopUpMessage({
          type: "error",
          message: `Error saving: ${error.message}`,
        });
        // revert to previous value on error
        setValue(prevValue);
        setEditMode(false);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  if (editMode) {
    return (
      <CellEditable
        {...props}
        value={value}
        loading={loading}
        onChange={onChange}
        onCancel={onCancel}
        onSave={onSave}
      />
    );
  }

  return (
    <div className="tol-data-point" onDoubleClick={onDoubleClick}>
      <CellDisplay
        {...props}
        value={value}
      />
    </div>
  )
}