/*
SPDX-FileCopyrightText: 2022 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Status } from '../index';


const NoDataAlert = () => (
  <div className="d-flex justify-content-center p-5 m-5">
    <Status 
      status="warning"
      text="No data found"
    />
  </div>
)

export default NoDataAlert;
