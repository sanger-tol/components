/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import { SelectPicker } from "rsuite";

import type { ISingleselectField, TLabelAndValueData } from "..";

export interface PSingleSelect
  extends Omit<Partial<ISingleselectField>, "data"> {
  data: string[] | TLabelAndValueData;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  testid?: string;
  defaultValue?: string;
  cleanable?: boolean;
  searchable?: boolean;
}

export const SingleSelect = (props: PSingleSelect) => {
  const {
    testid,
    onChange,
    id: _id,
    type: _type,
    label: _label,
    helpText: _helpText,
    icon: _icon,
    labelInline: _labelInline,
    centered: _centered,
    section: _section,
    multiple: _multiple,
    minOne: _minOne,
    ...selectPickerProps
  } = props;
  const [data, setData] = useState([{}]);

  useEffect(() => {
    if (typeof props.data[0] === "string") {
      setData(props.data.map((item) => ({ label: item, value: item })));
    } else {
      setData(props.data);
    }
  }, [props.data]);

  return (
    <SelectPicker
      {...selectPickerProps}
      data={data}
      data-testid={testid}
      onChange={(value) => onChange(value ?? "")}
    />
  );
};
