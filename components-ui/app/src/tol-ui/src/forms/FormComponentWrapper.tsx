/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React, { useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock } from "@fortawesome/free-solid-svg-icons";
import { FormLabel, RSForm, TFormComponentWrapper } from "..";
import { FormOptionsContext } from "./FormOptionsContext";
import { AUTOMATIC_FIELD_HELP_TEXT } from "../constants/form.constants";

export interface PFormComponentWrapper extends TFormComponentWrapper {
  /** Current field value, used to distinguish empty locked fields. */
  value?: unknown;
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

/**
 * @autodoc
 *
 * Wraps a form control in a consistently structured form group. It renders the
 * field label, optional icon and help text, child control, and validation error
 * message, while supporting inline labels and a configurable wrapper element.
 */
export function FormComponentWrapper(props: PFormComponentWrapper) {
  const formOptions = useContext(FormOptionsContext);
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
    requiredAsText,
    readOnly,
    automatic,
    recommended,
    value,
  } = props;
  const inline = formOptions.inlineLabels || labelInline;

  const ContentWrapper = as === "span" ? "span" : "div";
  const ControlsWrapper = as === "span" ? "span" : "div";
  const AutomaticControlWrapper = as === "span" ? "span" : "div";
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
      <ContentWrapper className={inline ? "tol-form-field-inline" : ""}>
        <ControlsWrapper
          className={inline ? "tol-form-field-inline-controls" : ""}
        >
          <FormLabel
            label={label}
            icon={icon}
            inline={inline}
            required={required}
            requiredAsText={requiredAsText}
            readOnly={readOnly}
            automatic={automatic}
            recommended={recommended}
            value={value}
          />
          {automatic ? (
            <AutomaticControlWrapper className="tol-form-automatic-control">
              <FontAwesomeIcon
                className="tol-form-automatic-placeholder-lock"
                icon={faLock}
                aria-hidden="true"
              />
              {children}
            </AutomaticControlWrapper>
          ) : (
            children
          )}
        </ControlsWrapper>
        {helpText && <RSForm.HelpText>{helpText}</RSForm.HelpText>}
        {automatic && (
          <RSForm.HelpText>{AUTOMATIC_FIELD_HELP_TEXT}</RSForm.HelpText>
        )}
        {errorMessageClassName ? (
          <span className={errorMessageClassName}>{errorMessage}</span>
        ) : (
          errorMessage
        )}
      </ContentWrapper>
    </RSForm.Group>
  );
}
