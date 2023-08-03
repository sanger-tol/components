/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Alert } from '../index'


const TableErrorAlert = (props: {error: string}) => (
  <div className="d-flex justify-content-center p-5 m-5">
    <Alert 
      type="danger"
      message={props.error}
    />
  </div>
)

export default TableErrorAlert;
