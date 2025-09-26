/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import { Whisper, SelectPicker, Tooltip } from "rsuite";

export interface PSingleSelect {
  data: string[];
  placeholder?: string;
  value: string;
  setValue: any;
  disabled?: boolean;
  disabledTooltip?: string;
  block?: boolean;
}

export const SingleSelect = (props: PSingleSelect) => {
  const { placeholder, setValue, value, disabledTooltip, block } = props;
  
  let { disabled } = props;
  if (!disabled) {
    // Convert `disabled` from a falsy value to explicitly `false`
    // This is required for disabled props in components below
    disabled = false;
  }
 
  const [data, setData] = useState([{}]);

  useEffect(() => {
    setData(props.data.map((item) => ({ label: item, value: item })));
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
          onChange={setValue}
          placeholder={placeholder}
          disabled={disabled}
          block={block}
        />
      </span>
    </Whisper>
  );
};
