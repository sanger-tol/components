/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Alert } from 'react-bootstrap';


const NoDataAlert = () => (
  <div className="d-flex justify-content-center p-5">
    <Alert key="warning" variant="warning">
      No data found
    </Alert>
  </div>
)

export default NoDataAlert;
