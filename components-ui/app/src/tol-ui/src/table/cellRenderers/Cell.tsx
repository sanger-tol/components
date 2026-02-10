/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import {
  TDataObjectOrNull,
  TCellRenderer,
  ICustomCellRenderers,
  TsDataSource,
  CellDisplay,
  PopUpMessage,
  CellEditable,
} from "../..";


export interface PCell {
  attribute: string,
  value?: any,
  dataObject: TDataObjectOrNull,
  dataSource?: TsDataSource,
  renderer: TCellRenderer;
  setExpandedRows: any,
  customCellRenderers?: ICustomCellRenderers;
  editable?: boolean;
}

export function Cell(props: PCell) {
  const { dataObject, dataSource, editable } = props;
  const [value, setValue] = useState(props.value);
  const [prevValue, setPrevValue] = useState(props.value);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const canEdit = (
    typeof value === "string" || value instanceof String
  );

  const onDoubleClick = () => {
    if (!editable) return;
    if (canEdit) {
      setEditMode(true);
    } else {
      PopUpMessage({
        type: "info",
        message: "Only string cells are editable currently.",
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
              [props.attribute]: value,
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

  const collectDisplays = () => {
    // Normalise value to an array to allow for consistent handling of multiple values and single values
    if (Array.isArray(value)) {
      const valueSet = new Set(value);

      return Array.from(valueSet).map((val) => (
        <CellDisplay {...props} tag value={val} />
      ));
    }
    return <CellDisplay {...props} value={value} />;
  };

  return (
    <div className="tol-cell" onDoubleClick={onDoubleClick}>
      {collectDisplays()}
    </div>
  )
}