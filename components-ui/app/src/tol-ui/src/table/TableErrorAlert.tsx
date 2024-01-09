/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Status } from '../index';


const TableErrorAlert = (props: {error: string}) => (
  <div className="d-flex justify-content-center p-5 m-5">
    <Status 
      status="danger"
      text={props.error}
    />
  </div>
);

export default TableErrorAlert;
