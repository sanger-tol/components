/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React from "react";
import { FormLabel, IFormComponent, RSForm } from "..";

export interface PFormComponentWrapper extends Partial<
  Omit<IFormComponent, "type">
> {
  id?: string;
  children: React.ReactNode;
  errorText?: string;
  errorMessageClassName?: string;
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
