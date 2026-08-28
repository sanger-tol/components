/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Input } from "rsuite";
import { CellEditableControls, PCellDisplay } from "../..";

export interface PCellEditableText extends PCellDisplay {
  loading: boolean;
  floatingControls?: boolean;
  onChange: (newValue: string | Date) => void;
  onCancel: () => void;
  onSave: () => void;
}

export function CellEditableText(props: PCellEditableText) {
  const { value, loading, floatingControls, onChange, onCancel, onSave } =
    props;

  return (
    <>
      <Input
        autoFocus
        value={value}
        onChange={onChange}
        onPressEnter={onSave}
      />
      <CellEditableControls
        loading={loading}
        floatingControls={floatingControls}
        onCancel={onCancel}
        onSave={onSave}
      />
    </>
  );
}