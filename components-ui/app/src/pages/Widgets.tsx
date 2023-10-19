/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Widgets,
         RemoteBarChart,
         RemoteSunburst,
         RemoteTable,
         RemoteBubbleMap,
         env } from '../tol-ui/src'


const chart = (
  <RemoteBarChart
    stacked
    title="Run Data"
    endpoint="run_data"
    breakDownBy="mlwh_platform_type"
    xAxis="mlwh_start_date"
    type="date"
    interval="M"
    height={ 250 }
    baseUrl={ env.TOL_DATA }
  />
)

const sunburst = (
  <RemoteSunburst
    title="Order of remote..."
    endpoint="species"
    sliceBy={ ["sts_order_group"] }
    height={ 250 }
    baseUrl={ env.TOL_DATA }
    legendPosition='right'
  />
)

const table = (
  <RemoteTable
    id="species-1"
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
    baseUrl={ env.TOL_DATA }
  />
)

const map = (
  <RemoteBubbleMap
    endpoint="sample"
    longitudeKey="sts_latitude"
    latitudeKey="sts_longitude"
    height={ 500 }
    pageSize={ 10000 }
    baseUrl={ env.TOL_DATA }
  />
)

function Sandbox() {
  return (
    <div className="sandbox">
      <Widgets
        title="Run Data"
        description="Hello this a test desc..."
        components={{
          "chart-1": {
            element: chart,
            size: 'sm'
          },
          "sunburst-1": {
            element: sunburst,
            size: 'sm'
          },
          "table-1": {
            element: table,
            size: 'md'
          },
          "map-1": {
            element: map,
            size: 'md'
          },
        }}
      />
    </div>
  );
}

export default Sandbox;
