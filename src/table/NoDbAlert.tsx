/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Alert } from 'react-bootstrap';


const NoDbAlert = () => (
  <div className="d-flex justify-content-center p-5">
    <Alert key="danger" variant="danger">
      Cannot connect to database or endpoint is incorrect
    </Alert>
  </div>
)

export default NoDbAlert;
