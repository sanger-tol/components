/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Widgets, RemoteBarChart, RemoteSunburst, RemoteTable } from '../tol-ui/src'


const chartOne = (
  <RemoteBarChart
    stacked
    title="Run Data"
    endpoint="run_data"
    breakDownBy="mlwh_platform_type"
    xAxis="mlwh_start_date"
    type="date"
    interval="M"
    height={ 500 }
  />
)

const chartTwo = (
  <RemoteSunburst
    title="Order of remote..."
    endpoint="species"
    sliceBy={ ["sts_order_group"] }
    height={ 500 }
  />
)

const table = (
  <RemoteTable
    endpoint="species"
    height={ 500 }
    fields={{
      "id": {
        rename: "Taxonomy ID"
      },
      "sts_scientific_name": {
        rename: "Scientific Name"
      },
      "sts_family": {
        rename: "Family"
      },
      "sts_order_group": {
        rename: "Order"
      },
      "tolid_prefix": {
        rename: "ToLID prefix"
      },
    }}
  />
)

function Sandbox() {
  return (
    <div className="sandbox">
      <Widgets
        title="Run Data"
        description="Hello this a test desc..."
        components={[chartOne, chartTwo, table, chartOne]}
      />
    </div>
  );
}

export default Sandbox;