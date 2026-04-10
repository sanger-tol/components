/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import {
  ACTIONS,
  API_METHODS,
  CellDisplay,
  CellEditable,
  CellEditableStatus,
  getFieldByName,
  PDataPoints,
  PopUpMessage,
} from "../..";


export interface PDataPoint extends PDataPoints {
  /**
   * Whether the data point is being rendered within a tag component. Used for styling purposes.
   */
  isMany?: boolean,
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
    isMany,
    actsAs,
  } = props;

  const attributeValue = getFieldByName(dataObject, field);

  const [value, setValue] = useState(attributeValue);
  const [prevValue, setPrevValue] = useState(attributeValue);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const canEdit = (
    actsAs === "status" || typeof value === "string" || value instanceof Date
  );

  const onDoubleClick = () => {
    if (!editable) return;
    if (canEdit) {
      setEditMode(true);
    } else {
      PopUpMessage({
        type: "info",
        message: "Only string & Date values are editable currently.",
      })
    }
  }

  const onChange = (newValue: string | Date) => {
    setValue(newValue);
  }

  const onCancel = () => {
    setEditMode(false);
    setValue(prevValue);
  };

  const onSaveStatus = (selectedStatusTypeId: string) => {
    if (!dataObject) return;
    setLoading(true);
    const parentObjectType = dataObject.objectType.replace(/_status$/, "");
    const actionBaseUrl = dataSource
      .getBaseUrl()
      ?.replace(/\/data(?:\/[^/]+)?$/, "");

    dataSource
      .custom({
        method: API_METHODS.POST,
        resource: `local/${parentObjectType}:action`,
        body: {
          data: {
            ids: [dataObject.id],
            action_name: "SetStatusAction",
            object_type: parentObjectType,
            params: { status: selectedStatusTypeId },
          },
        },
        options: actionBaseUrl ? { baseURL: actionBaseUrl } : undefined,
      })
      .then(() => {
        setEditMode(false);
        PopUpMessage({ type: "success", message: "Status updated successfully." });
      })
      .catch((error: any) => {
        PopUpMessage({ type: "error", message: `Error saving: ${error.message}` });
        setEditMode(false);
      })
      .finally(() => setLoading(false));
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
    if (actsAs === "status" && dataObject) {
      return (
        <CellEditableStatus
          {...props}
          value={value}
          loading={loading}
          statusTypeObjectType={dataObject.objectType}
          onCancel={onCancel}
          onSave={onSaveStatus}
        />
      );
    }
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

  // If the value is an array we produce separate CellDisplays for each item in the array.
  const normalisedValue = Array.isArray(value) ? value : [value];
  const DataDisplays = (
    <>
      {normalisedValue.map((v, index) => (
        <CellDisplay
          {...props}
          key={`${field}-${index}`}
          value={v}
          isMany={isMany || Array.isArray(value)}
        />
      ))}
    </>
  );

  return (
    <div
      className="tol-data-point"
      onDoubleClick={onDoubleClick}
    >
      {DataDisplays}
    </div>
  )
}
