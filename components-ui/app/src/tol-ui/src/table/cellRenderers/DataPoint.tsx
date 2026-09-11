/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import {
  CellDisplay,
  CellEditable,
  getFieldByName,
  PDataPoints,
  TDataObjectOrNull,
} from "../..";


export interface PDataPoint extends PDataPoints {
  /** Whether the data point is being rendered within a tag component. Used for styling purposes. */
  isMany?: boolean,
  /** The parent DataObject, used for upsert calls when saving edits to the data point. */
  originDataObject: TDataObjectOrNull;
  /** The field in the parent DataObject that this data point corresponds to. */
  originField: string;
}

/**
 * Singular data point renderer. Used within DataPoints to render each individual data point.
 * Can take a renderer to allow for custom rendering of the data point.
 */
export function DataPoint(props: PDataPoint) {
  const {
    field,
    dataObject,
    editable,
    isMany,
    meta,
  } = props;

  const attributeValue = getFieldByName(dataObject, field);

  const [value, setValue] = useState(attributeValue);
  const [editMode, setEditMode] = useState(false);

  // TODO FUTURE: Allow for string and date updates via permissions
  const canEdit = (
    meta.actsAs === "status" ||
    meta.actsAs === "relationshipIdentifier"
  );

  const onDoubleClick = () => {
    if (!editable) return;
    if (canEdit) setEditMode(true);
  }

  const onExit = () => {
    setEditMode(false);
  };

  if (editMode) {
    return (
      <CellEditable
        {...props}
        value={value}
        setValue={setValue}
        onExit={onExit}
      />
    )
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
