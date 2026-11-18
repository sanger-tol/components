/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { AttributeSelector, FormComponentWrapper } from "..";
import type { PAttributeSelector, TFormComponentWrapper } from "..";

export interface PFormAttributeSelector
  extends Omit<PAttributeSelector, "attribute" | "setAttributes">,
    TFormComponentWrapper {
  /**
   * The name of the form field. This is used to identify the field in the form data.
   */
  name: string;
  /**
   * The selected attribute names, represented as an array even when maxSelections is 1.
   */
  value: string[];
  /**
   * Called with the updated attribute names when the selection changes or is cleared.
   */
  onChange: (value: string[]) => void;
  /**
   * Validation error text displayed below the attribute selector.
   */
  errorText?: string;
}

/**
 * @autodoc
 *
 * Wraps AttributeSelector in a form group with a label, optional help text, and
 * validation errors. It maps the controlled value and onChange props to the
 * selector's attribute and setAttributes props, forwarding its other options.
 */
export function FormAttributeSelector(props: PFormAttributeSelector) {
  const { value, onChange, errorText, ...selectorProps } = props;

  return (
    <FormComponentWrapper {...props}>
      <AttributeSelector
        {...selectorProps}
        attribute={value}
        setAttributes={onChange}
      />
    </FormComponentWrapper>
  );
}
