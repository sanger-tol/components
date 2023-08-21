/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Widgets, RemoteBarChart, RemoteSunburst } from '../tol-ui/src'


const chartOne = (
  <RemoteBarChart
    stacked
    title="Run Data"
    endpoint="run_data"
    breakDownBy="mlwh_platform_type"
    xKey="mlwh_start_date"
    type="date"
    interval="M"
    height={ 500 }
  />
)

const chartTwo = (
  <RemoteSunburst
    title="Order of remote..."
    endpoint="species"
    sliceBy={ ["sts_order_group", "sts_family", "sts_genus"] }
    height={ 500 }
  />
)

function Sandbox() {
  return (
    <div className="sandbox">
      <Widgets
        title="Run Data"
        description="Hello this a test desc..."
        components={[chartOne, chartTwo, chartTwo, chartOne]}
      />
    </div>
  );
}

export default Sandbox;