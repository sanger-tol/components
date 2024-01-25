/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Widgets,
  RemoteBarChart,
  RemoteSunburst,
  RemoteTable,
  RemoteBubbleMap,
  env } from '../tol-ui/src';


const chart = (
  <RemoteBarChart
    stacked
    title="Run Data"
    endpoint="run_data"
    breakDownBy="mlwh_platform_type"
    xAxis="mlwh_start_date"
    type="date"
    interval="M"
    height={ 600 }
    baseUrl={ env.TOL_DATA }
  />
);

const sunburst = (
  <RemoteSunburst
    title="Order of remote..."
    endpoint="species"
    sliceBy={ ["sts_order_group"] }
    height={ 600 }
    baseUrl={ env.TOL_DATA }
  />
);

const table = (
  <RemoteTable
    id="sample"
    endpoint="sample"
    height={ 600 }
    baseUrl={ env.TOL_DATA }
  />
);

const map = (
  <RemoteBubbleMap
    endpoint="sample"
    longitudeKey="sts_latitude"
    latitudeKey="sts_longitude"
    height={ 600 }
    pageSize={ 10000 }
    baseUrl={ env.TOL_DATA }
  />
);

function Sandbox() {
  return (
    <div className="sandbox">
      <Widgets
        title="Run Data"
        description="Hello this a test desc..."
        components={[chart, sunburst, table, map]}
      />
    </div>
  );
}

export default Sandbox;
