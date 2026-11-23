/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { AutoComplete as RSAutoComplete } from "rsuite";
import {
  FormComponentWrapper,
  normaliseCaps,
  Loader,
  TFormAutoCompleteField,
  TAutoCompleteValue,
} from "..";

export interface PAutoComplete extends TFormAutoCompleteField {
  name?: string;
  value: TAutoCompleteValue;
  onChange?: (value: string) => void;
  displayFields?: object;
  displayFieldsTitle?: boolean;
  loading?: boolean;
  onSelect?: (value: string) => void;
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
    readOnly,
    placeholder,
    onSelect,
  } = props;

  return (
    <FormComponentWrapper {...props} id={name}>
      <RSAutoComplete
        data={data}
        value={typeof value === "string" ? value : value?.value}
        placeholder={placeholder}
        disabled={readOnly}
        onChange={onChange}
        onSelect={onSelect}
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
                  },
                )}
            </>
          );
        }}
      />
    </FormComponentWrapper>
  );
}
