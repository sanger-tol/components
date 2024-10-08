/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React from "react";
import { RSForm } from "../index";
import { capitaliseFirstLetter } from "../general/Utils";

interface Props {
  id: string;
  name: string;
  label: string;
  accepter?: React.Element; // Allows custom elements to be passed in
  helpText?: string;
  placeholder?: string;
  value?: string;
  onChange?: Function;
  type?: string;
  readOnly?: boolean;
  required?: boolean;
  centered?: boolean;
}

function FormTextField(props: Props) {
  const { id, name, centered, label, accepter, helpText, ...rest } = props;
  let style = {};

  centered ? (style = { ...style, textAlign: "center" }) : null;

  return (
    <RSForm.Group controlId={`form-${id}-${capitaliseFirstLetter(name)}`}>
      <RSForm.ControlLabel>{label}</RSForm.ControlLabel>
      <RSForm.Control
        style={style}
        name={name}
        accepter={accepter}
        {...rest}
      />
      {helpText && <RSForm.HelpText>{helpText}</RSForm.HelpText>}
    </RSForm.Group>
  );
}

export default FormTextField;
