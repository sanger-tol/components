/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { CellEditableDatetime, CellEditableStatus, CellEditableText, PCellDisplay } from "../..";

export interface PCellEditable extends PCellDisplay {
  loading: boolean;
  floatingControls?: boolean;
  onChange: (newValue: string | Date) => void;
  onCancel: () => void;
  onSave: () => void;
}

export function CellEditable(props: PCellEditable) {
  const { type, actsAs } = props.meta;

  if (type === "datetime") {
    return <CellEditableDatetime {...props} />;
  } else if (actsAs === "status") {
    return <CellEditableStatus {...props} />;
  }

  return <CellEditableText {...props} />;
}
