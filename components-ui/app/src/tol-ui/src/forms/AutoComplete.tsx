/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { AutoComplete as RSAutoComplete } from "rsuite";
import { RSForm } from "..";

interface Props {
  label?: string;
  data: string[];
  value: string;
  onChange?: any;
}

export function AutoComplete(props: Props) {
  const { label, data, value, onChange } = props;

  return (
    <div>
      {label && <RSForm.ControlLabel>{label}</RSForm.ControlLabel>}
      <RSAutoComplete data={data} value={value} onChange={onChange} />
    </div>
  );
}
