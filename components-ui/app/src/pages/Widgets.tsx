/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  Widgets as W,
  RemoteBarChart,
  RemoteSunburst,
  RemoteTable,
  RemoteMap,
  env,
  RemoteCount
} from '../tol-ui/src';


const chart = (
  <RemoteBarChart
    stacked
    title="Run Data"
    endpoint="run_data"
    breakDownBy="mlwh_platform_type"
    xAxis="mlwh_run_complete"
    type="date"
    interval="M"
    baseUrl={ env.TOL_DATA }
  />
);

const sunburst = (
  <RemoteSunburst
    title="Order of remote..."
    endpoint="species"
    sliceBy={ ["sts_order_group"] }
    baseUrl={ env.TOL_DATA }
  />
);

const table = (
  <RemoteTable
    id="run_data_1"
    endpoint="run_data"
    baseUrl={ env.TOL_DATA }
  />
);

const map = (
  <RemoteMap
    bubble
    endpoint="sample"
    longitudeKey="sts_latitude"
    latitudeKey="sts_longitude"
    pageSize={ 10000 }
    baseUrl={ env.TOL_DATA }
  />
);

const count1 = (
  <RemoteCount
    title='Run Data'
    endpoint='run_data'
    baseUrl={ env.TOL_DATA }
  />
);

const count2 = (
  <RemoteCount
    title='Species'
    endpoint='species'
    baseUrl={ env.TOL_DATA }
  />
);

const components = [
  {
    component: <h2>Example data</h2>,
    type: 'full'
  },
  {
    component: count1,
    type: 'sm'
  },
  {
    component: count2,
    type: 'sm'
  },
  {
    component: count1,
    type: 'sm'
  },
  {
    component: count2,
    type: 'sm'
  },
  {
    component: chart,
    type: 'md'
  },
  {
    component: sunburst,
    type: 'md'
  },
  {
    component: map,
    type: 'lg'
  },
  {
    component: table,
    type: 'xl'
  }
];

function Widgets() {
  return (
    <div className="widgets">
      <W
        components={components}
      />
    </div>
  );
}

export default Widgets;
