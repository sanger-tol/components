/*
SPDX-FileCopyrightText: 2022 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Alert } from '../index';


interface Props {
  tube_id: string,
}

function TempStatusExample(props: Props) {
  const tube_id = props.tube_id

  if (parseInt(tube_id.charAt(0)) < 5) {
    return (
      <Alert
        type="success"
        message={props.tube_id}
      />
      );
  } else {
    return (
      <Alert
        type="danger"
        message={props.tube_id}
      />
    );
  }
}

export default TempStatusExample;
