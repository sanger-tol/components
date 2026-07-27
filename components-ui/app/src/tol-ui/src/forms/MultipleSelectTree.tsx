/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { CheckTreePicker as RSCheckTreePicker } from "rsuite";

import { FormComponentWrapper } from "..";
import type {
  IHierachicalData,
  TFormMultipleSelectTreeField,
  TUnformattedMultipleSelectTreeFieldValue
} from "..";

export interface PMultipleSelectTree extends TFormMultipleSelectTreeField {
  name?: string;
  value: TUnformattedMultipleSelectTreeFieldValue;
  setValue: React.Dispatch<React.SetStateAction<TUnformattedMultipleSelectTreeFieldValue>>;
  errorText?: string;
};

export function MultipleSelectTree(props: PMultipleSelectTree) {
  const {
    name,
    errorText,
    value,
    setValue,
    data,
  } = props;

  const dataFormatCallback = (data: Omit<IHierachicalData, "label">): IHierachicalData => ({
    value: data.value,
    label: data.value,
    children: data.children?.map(dataFormatCallback)
  });
  const formattedData = data.map(dataFormatCallback);

  return (
    <FormComponentWrapper
      id={name}
      as="span"
      errorText={errorText}
      errorMessageClassName="tol-multiple-select-error-message"
    >
      <RSCheckTreePicker
        value={value}
        onChange={setValue}
        data={formattedData}
      />
    </FormComponentWrapper>
  );
}
