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
  PDataPoints,
  Tag,
} from "../..";


export interface PDataPoint extends PDataPoints {
  /**
   * Whether to wrap the value in a tag element.
   */
  isTag?: boolean,
  /**
   * The id of the currently active data point. Initially used for images.
   */
  activeObjectId?: string | null,
  /**
   * Setter function to set the active data point id.
   */
  setActiveObjectId?: React.Dispatch<React.SetStateAction<string | null>>,
}

/**
 * Singular data point renderer. Used within DataPoints to render each individual data point.
 * Can take a renderer to allow for custom rendering of the data point.
 */
export function DataPoint(props: PDataPoint) {
  const {
    field,
    dataObject,
    dataSource,
    editable,
    isTag = false,
    setActiveObjectId = () => { },
  } = props;

  const v = getFieldByName(dataObject, field);

  const [value, setValue] = useState(v);
  const [prevValue, setPrevValue] = useState(v);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const canEdit = (
    typeof value === "string"
  );

  const onClick = () => {
    setActiveObjectId((prev) => (prev === value ? null : value));
  }

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

  let DataDisplay = (
    <CellDisplay
      {...props}
      value={value}
    />
  )

  // deal with falsy values
  if (!value) {
    DataDisplay = <span className="tol-data-point-empty">None</span>;
  }

  const Content = (
    <div
      className="tol-data-point"
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      {DataDisplay}
    </div>
  )

  return isTag ? <Tag>{Content}</Tag> : Content;
}