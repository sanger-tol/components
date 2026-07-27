/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { CheckTreePicker as RSCheckTreePicker } from "rsuite";

import { FormComponentWrapper, isPropDefined } from "..";
import type {
  IHierachicalData,
  TFormMultipleSelectTreeField,
  TUnformattedMultipleSelectTreeFieldValue
} from "..";

export interface PMultipleSelectTree extends TFormMultipleSelectTreeField {
  name?: string;
  value: string[];
  setValue: React.Dispatch<React.SetStateAction<string[]>>;
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

  const block = isPropDefined(props.block);

  const dataFormatCallback = (data: TUnformattedMultipleSelectTreeFieldValue): IHierachicalData => ({
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
        block={block}
      />
    </FormComponentWrapper>
  );
}
