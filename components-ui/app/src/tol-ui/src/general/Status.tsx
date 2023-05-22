/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faMinus, faXmark, faInfo } from '@fortawesome/free-solid-svg-icons';


function getTypeFromStatus(status: string) {
  switch(status) {
    case 'green':
      return 'success';
    case 'amber':
      return 'warning';
    case 'red':
      return 'danger';
    default:
      return 'primary';
  }
}

function getIconFromStatus(status: string) {
  switch(status) {
    case 'green':
      return faCheck;
    case 'amber':
      return faMinus;
    case 'red':
      return faXmark;
    default:
      return faInfo;
  }
}

interface Props {
  text: string,
  status: 'green'|'amber'|'red'|'blue'
}

function Status(props: Props) {
  const { text, status } = props;
  const type = getTypeFromStatus(status);
  const icon = getIconFromStatus(status);

  return (
    <Alert
      key={type}
      variant={type}
    >
      <FontAwesomeIcon icon={icon} size="sm" />
      <span className="m-3">{text}</span>
    </Alert>
  );
}

export default Status;
