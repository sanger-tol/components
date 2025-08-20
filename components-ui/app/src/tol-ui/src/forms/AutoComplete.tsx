/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { AutoComplete as RSAutoComplete } from "rsuite";
import { RSForm } from "..";

export interface PAutoComplete {
  label?: string;
  data: string[];
  value: string;
  onChange?: any;
  displayFields?: object;
}

export function AutoComplete(props: PAutoComplete) {
  const { label, data, value, onChange, displayFields } = props;


  return (
    <div>
      {label && <RSForm.ControlLabel>{label}</RSForm.ControlLabel>}
      <RSAutoComplete
        data={data}
        value={value}
        onChange={onChange}
        renderMenuItem={(item) => {
          return (
            <>
              {item}
              {displayFields && displayFields[item.props.children].map((field: string, index: number) => (
                <div key={index}>{field}</div>
              ))}
            </>
          )
        }}
      />
    </div>
  );
}
