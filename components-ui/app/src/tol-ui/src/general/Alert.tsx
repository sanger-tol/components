/*
SPDX-FileCopyrightText: 2022 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Alert as AlertBS } from "react-bootstrap";

interface Props {
  type: string
  message: string
}

function Alert(props: Props) {
  return (
    <AlertBS key={props.type} variant={props.type}>
      {props.message}
    </AlertBS>
  );
}

export default Alert;
