/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import { SelectPicker } from "rsuite";
import { RSForm } from "src";

export interface PSingleSelect {
  data: string[];
  placeholder?: string;
  value: string;
  setValue: any;
  block?: boolean;
}

export const SingleSelect = (props: PSingleSelect) => {
  const { placeholder, setValue, value, block } = props;
  const [data, setData] = useState([{}]);

  useEffect(() => {
    setData(props.data.map((item) => ({ label: item, value: item })));
  }, [props.data]);

  return (
    <RSForm.Group groupId={data}>
      <SelectPicker
        data={data}
        searchable={false}
        value={value}
        onChange={setValue}
        placeholder={placeholder}
        block={block}
      />
      <RSForm.ErrorMessage show placement="bottomStart">PLACEHOLDER ERROR</RSForm.ErrorMessage>
    </RSForm.Group>
  );
};
