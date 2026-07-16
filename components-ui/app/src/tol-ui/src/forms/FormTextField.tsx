/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React from "react";
import { FormLabel, IFormLabelIcon, RSForm, capitaliseFirstLetter } from "..";

export interface PFormTextField {
  id: string;
  name: string;
  label: string;
  accepter?: React.ReactNode; // Allows custom elements to be passed in
  helpText?: string;
  placeholder?: string;
  value?: string;
  onChange?: Function;
  type?: string;
  readOnly?: boolean;
  required?: boolean;
  centered?: boolean;
  icon?: IFormLabelIcon;
  labelInline?: boolean;
}

export function FormTextField(props: PFormTextField) {
  const { id, name, centered, label, accepter, helpText, icon, labelInline, ...rest } =
    props;
  let style = {};

  centered ? (style = { ...style, textAlign: "center" }) : null;

  return (
    <RSForm.Group controlId={`form-${id}-${capitaliseFirstLetter(name)}`}>
      <div className={labelInline ? "tol-form-field-inline" : ""}>
        <FormLabel label={label} icon={icon} inline={labelInline} />
        <RSForm.Control
          style={style}
          name={name}
          accepter={accepter}
          {...rest}
        />
        {helpText && <RSForm.HelpText>{helpText}</RSForm.HelpText>}
      </div>
    </RSForm.Group>
  );
}
