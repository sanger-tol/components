/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React from "react";
import { FormLabel, RSForm, TFormComponentWrapper } from "..";

export interface PFormComponentWrapper extends TFormComponentWrapper {
  /**
   * The name of the form field. This is used to identify the field in the form data.
   */
  id?: string;
  /**
   * Elements to be wrapped by the FormComponentWrapper.
   * This can include input fields, buttons, or any other form-related elements.
   */
  children: React.ReactNode;
  /**
   * Error text to display when form fails validation. This will be displayed below the input field.
   */
  errorText?: string;
  /**
   * Optional class name for styling the error message. This allows for custom styling of the error message.
   */
  errorMessageClassName?: string;
  /**
   * Optional prop to specify the HTML element type for the wrapper.
   * This can be used to change the default 'div' wrapper to another element type, such as 'span'.
   */
  as?: React.ElementType;
}

export function FormComponentWrapper(props: PFormComponentWrapper) {
  const {
    id,
    name,
    label,
    children,
    helpText,
    icon,
    labelInline,
    errorText,
    errorMessageClassName,
    as,
    required,
  } = props;

  const ContentWrapper = as === "span" ? "span" : "div";
  const errorMessage = (
    <RSForm.ErrorMessage show={Boolean(errorText)} placement="bottomStart">
      {errorText}
    </RSForm.ErrorMessage>
  );

  return (
    <RSForm.Group
      controlId={id && name ? `form-${id}-${name}` : undefined}
      as={as}
    >
      <ContentWrapper className={labelInline ? "tol-form-field-inline" : ""}>
        <FormLabel
          label={label}
          icon={icon}
          inline={labelInline}
          required={required}
        />
        {children}
        {helpText && <RSForm.HelpText>{helpText}</RSForm.HelpText>}
        {errorMessageClassName ? (
          <span className={errorMessageClassName}>{errorMessage}</span>
        ) : (
          errorMessage
        )}
      </ContentWrapper>
    </RSForm.Group>
  );
}
