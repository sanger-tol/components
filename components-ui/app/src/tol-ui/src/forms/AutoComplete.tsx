/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { AutoComplete as RSAutoComplete } from "rsuite";
import {
  RSForm,
  normaliseCaps,
  Loader
} from "..";

export interface PAutoComplete {
  label: string;
  data: string[];
  value: string;
  onChange?: any;
  displayFields?: object;
  displayFieldsTitle?: boolean;
  loading?: boolean;
}

export function AutoComplete(props: PAutoComplete) {
  const { label, data, value, onChange, displayFields, displayFieldsTitle, loading } = props;


  return (
    <RSForm.Group controlId={label}>
      {label && <RSForm.ControlLabel>{label}</RSForm.ControlLabel>}
      <RSAutoComplete
        data={data}
        value={value}
        onChange={onChange}
        renderMenu={(menu: any) =>{
          if (loading === true) {
            return (
              <div style={{ textAlign: 'center' }}>
                <Loader />
              </div>
            )
          }
          return menu;
        }}
        renderMenuItem={(item: any) => {
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
      <RSForm.ErrorMessage show placement="bottomStart">PLACEHOLDER ERROR</RSForm.ErrorMessage>
    </RSForm.Group>
  );
}
