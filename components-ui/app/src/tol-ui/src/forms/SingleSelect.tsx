/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import { SelectPicker } from "rsuite";

export interface PSingleSelect {
  data: string[] | { label: string, value: string }[];
  placeholder?: string;
  value: string;
  setValue: any;
  block?: boolean;
}

export const SingleSelect = (props: PSingleSelect) => {
  const { placeholder, setValue, value, block } = props;
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
      data={data}
      searchable={false}
      value={value}
      onChange={setValue}
      placeholder={placeholder}
      block={block}
    />
  );
};
