/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { TagInput } from "rsuite";
import { FormComponentWrapper, TFormTags } from "..";

/** FormTags component props interface. */
export interface PFormTags extends TFormTags {
  /** Function to update the value of the tags. */
  setValue: (value: readonly string[]) => void;
  /** Whether the tags input is disabled. */
  disabled?: boolean;
}

/**
 * @autodoc
 *
 * FormTags component for managing tag inputs within a form.
 */
export function FormTags(props: PFormTags) {
  const {
    id,
    name,
    value,
    setValue,
    disabled,
    readOnly,
    placeholder,
    inputProps,
  } = props;

  const fieldId = id ?? name;

  return (
    <FormComponentWrapper {...props} id={fieldId}>
      <TagInput
        block
        {...inputProps}
        id={fieldId && name ? `{form-${fieldId}-{name}` : undefined}
        trigger={["Comma", "Enter"]}
        name={name}
        value={value}
        onChange={setValue}
        disabled={disabled}
        readOnly={readOnly}
        placeholder={placeholder}
        tagProps={{ className: "tol-form-tag" }}
      />
    </FormComponentWrapper>
  );
}
