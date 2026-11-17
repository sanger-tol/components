/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Toggle } from "rsuite";
import { FormComponentWrapper } from "../..";
import type { TFormComponentWrapper } from "../..";

export interface PFormToggle extends TFormComponentWrapper{
  /** The current toggle state. */
  value: boolean;
  /** Called with the updated toggle state. */
  onChange: (value: boolean) => void;
  /** Error text to display below the toggle. */
  errorText?: string;
}

export function FormToggle(props: PFormToggle) {
  const { id, name, value, onChange, readOnly } = props;
  return (
    <FormComponentWrapper {...props} id={id ?? name} value={value}>
      <Toggle
        id={id ?? name}
        name={name}
        checked={value}
        onChange={onChange}
        disabled={readOnly}
      />
    </FormComponentWrapper>
  );
}
