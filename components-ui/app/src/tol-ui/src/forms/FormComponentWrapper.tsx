/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React from "react";
import { FormLabel, IFormLabelIcon, RSForm } from "..";

export interface PFormComponentWrapper {
  id: string;
  name: string;
  label: string;
  children: React.ReactNode;
  helpText?: string;
  centered?: boolean;
  icon?: IFormLabelIcon;
  labelInline?: boolean;
}

export function FormComponentWrapper(props: PFormComponentWrapper) {
  const { id, name, label, children, helpText, icon, labelInline } =
    props;
  return (
    <RSForm.Group controlId={`form-${id}-${name}`}>
      <div className={labelInline ? "tol-form-field-inline" : ""}>
        <FormLabel label={label} icon={icon} inline={labelInline} />
        {children}
        {helpText && <RSForm.HelpText>{helpText}</RSForm.HelpText>}
      </div>
    </RSForm.Group>
  );
}
