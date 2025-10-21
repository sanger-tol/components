/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import { Whisper, SelectPicker, Tooltip } from "rsuite";

export interface PSingleSelect {
  data: string[] | { label: string, value: string }[];
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  block?: boolean;
  disabled?: boolean;
  disabledTooltip?: string;
}

export const SingleSelect = (props: PSingleSelect) => {
  const { placeholder, onChange, value, block, disabled, disabledTooltip } = props;
  const [data, setData] = useState([{}]);

  useEffect(() => {
    if (typeof props.data[0] === "string") {
      setData(props.data.map((item) => ({ label: item, value: item })));
    } else {
      setData(props.data);
    }
  }, [props.data]);

  const DisabledTooltip = (
    <Tooltip>{disabledTooltip}</Tooltip>
  );

  return (
    <Whisper open={disabled} speaker={DisabledTooltip}>
      <span>
        <SelectPicker
          data={data}
          searchable={false}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          block={block}
        />
      </span>
    </Whisper>
  );
};
