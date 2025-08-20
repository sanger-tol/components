/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { AutoComplete as RSAutoComplete } from "rsuite";
import { RSForm, normaliseCaps } from "..";

export interface PAutoComplete {
  label?: string;
  data: string[];
  value: string;
  onChange?: any;
  displayFields?: object;
  displayFieldsTitle?: boolean;
}

export function AutoComplete(props: PAutoComplete) {
  const { label, data, value, onChange, displayFields, displayFieldsTitle } = props;


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
              {displayFields && displayFields[item.props.children].map((fieldObj: object, index: number) => {
                const [key, value] = Object.entries(fieldObj)[0];
                if (displayFieldsTitle) {
                  return <div key={index}>{normaliseCaps(key)}: {value}</div>;
                }
                return <div key={index}>{value}</div>;
              })}
            </>
          )
        }}
      />
    </div>
  );
}
