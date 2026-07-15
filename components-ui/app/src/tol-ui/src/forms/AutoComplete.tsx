/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { AutoComplete as RSAutoComplete } from "rsuite";
import {
  FormComponentWrapper,
  normaliseCaps,
  Loader,
  IAutocompleteField,
  TAutoCompleteValue
} from "..";

export interface PAutoComplete
  extends Omit<IAutocompleteField, "type" | "name" | "dataSource"> {
  name?: string;
  value: TAutoCompleteValue;
  onChange?: (value: string) => void;
  displayFields?: object;
  displayFieldsTitle?: boolean;
  loading?: boolean;
  errorText?: string;
}

export function AutoComplete(props: PAutoComplete) {
  const {
    name,
    data,
    value,
    onChange,
    displayFields,
    displayFieldsTitle,
    loading,
  } = props;


  return (
    <FormComponentWrapper {...props} id={name}>
      <RSAutoComplete
        data={data}
        value={typeof value === "string" ? value : value?.value}
        onChange={onChange}
        onKeyDown={(e) => e.stopPropagation()}
        renderMenu={(menu: any) => {
          if (loading === true) {
            return (
              <div style={{ textAlign: "center" }}>
                <Loader />
              </div>
            );
          }
          return menu;
        }}
        renderMenuItem={(item: any) => {
          return (
            <>
              {item}
              {displayFields &&
                displayFields[item.props.children].map(
                  (fieldObj: object, index: number) => {
                    const [key, value] = Object.entries(fieldObj)[0];
                    if (displayFieldsTitle) {
                      return (
                        <div key={index}>
                          {normaliseCaps(key)}: {value}
                        </div>
                      );
                    }
                    return <div key={index}>{value}</div>;
                  }
                )}
            </>
          );
        }}
      />
    </FormComponentWrapper>
  );
}
