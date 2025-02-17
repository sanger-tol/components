/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Alert } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faMinus,
  faXmark,
  faInfo,
} from "@fortawesome/free-solid-svg-icons";

type Status = "success" | "warning" | "danger" | "primary";

interface Props {
  text: string;
  status: Status | string;
}

function getIconFromStatus(status: string) {
  switch (status) {
    case "success":
      return faCheck;
    case "warning":
      return faMinus;
    case "danger":
      return faXmark;
    default:
      return faInfo;
  }
}

function Status(props: Props) {
  const { text, status } = props;
  const type = status;
  const icon = getIconFromStatus(status);

  return (
    <div className="tol-status">
      <Alert key={type} variant={type}>
        <FontAwesomeIcon icon={icon} size="sm" />
        <span className="status-text">{text}</span>
      </Alert>
    </div>
  );
}

export default Status;
