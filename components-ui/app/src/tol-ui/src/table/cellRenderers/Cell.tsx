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
  useBoardPrivilege,
  PRIVILEGE,
} from "../..";


export interface PCell {
  attribute: string,
  value?: any,
  dataObject: TDataObjectOrNull,
  dataSource?: TsDataSource,
  renderer: TCellRenderer;
  setExpandedRows: any,
  customCellRenderers?: ICustomCellRenderers;
}

export function Cell(props: PCell) {
  const { dataObject, dataSource } = props;
  const [value, setValue] = useState(props.value);
  const [prevValue, setPrevValue] = useState(props.value);
  const [editable, setEditable] = useState(false);
  const [loading, setLoading] = useState(false);
  const { privilege } = useBoardPrivilege();

  const userCanEdit = (
    (typeof value === "string" || value instanceof String) &&
    privilege === PRIVILEGE.BOARD.EDITABLE
  );

  const onDoubleClick = () => {
    if (userCanEdit) {
      setEditable(true);
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
    setEditable(false);
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
        setEditable(false)
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
        setEditable(false);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  if (editable) {
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
    <span onDoubleClick={onDoubleClick}>
      <CellDisplay
        {...props}
        value={value}
      />
    </span>
  )
}