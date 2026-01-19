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
  InlineEdit,
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
  const [value, setValue] = useState(props.value);
  const [editable, setEditable] = useState(false);

  if (editable) {
    return (
      <InlineEdit
        editable
        text={value}
        onSave={(newValue: string) => {
          setValue(newValue);
          setEditable(false);
        }}
      />
    );
  }

  return (
    <span onClick={() => setEditable(true)}>
      <CellDisplay {...props} />
    </span>
  )
}