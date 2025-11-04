/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import { SelectPicker } from "rsuite";
import { TLabelAndValueData } from "..";


export interface PSingleSelect {
  data: string[] | TLabelAndValueData;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  block?: boolean;
  disabled?: boolean;
  loading?: boolean;
}

export const SingleSelect = (props: PSingleSelect) => {
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
      {...props}
      data={data}
    />
  );
};
