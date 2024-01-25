/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Status } from '../index';


function setStatusType(firstNum: number) {
  switch(firstNum) {
  case 1:
  case 2:
  case 3:
    return 'success';
  case 4:
  case 5:
    return 'warning';
  case 6:
  case 7:
    return 'primary';
  default:
    return 'danger';
  }
}

interface Props {
  param: string,
  rowData: any
}

function StatusExample(props: Props) {
  const { param } = props;
  if (param === null) return <></>;

  let firstNum: number;
  try {
    firstNum = parseInt(param.charAt(0));
  } catch(e: any) {
    firstNum = 7;
  }

  console.log(props);

  return (
    <Status
      text={props.param}
      status={setStatusType(firstNum)}
    />
  );
}

export default StatusExample;
