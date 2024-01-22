/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from 'react';
import { Widgets,
  RemoteMultipleSelectFilters,
  RemoteBarChart,
  RemoteSunburst,
  RemoteTable,
  RemoteBubbleMap,
  env, CountWidget} from '../tol-ui/src';

const chart = (
  <RemoteBarChart
    stacked
    title="Run Data"
    endpoint="run_data"
    breakDownBy="mlwh_platform_type"
    xAxis="mlwh_start_date"
    type="date"
    interval="M"
    height={ 500 }
    baseUrl={ env.TOL_DATA }
  />
);

const sunburst = (
  <RemoteSunburst
    title="Order of remote..."
    endpoint="species"
    sliceBy={ ["sts_order_group"] }
    height={ 500 }
    baseUrl={ env.TOL_DATA }
  />
);

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
);

const map = (
  <RemoteBubbleMap
    endpoint="sample"
    longitudeKey="sts_latitude"
    latitudeKey="sts_longitude"
    height={ 500 }
    pageSize={ 10000 }
    baseUrl={ env.TOL_DATA }
  />
);

function Sandbox() {
  const [globalFilters, setGlobalFilters] = useState<object>({in_list: {}});
  console.log(globalFilters)
  const defaultFilter = {"in_list": {"mlwh_platform_type": ["Illumina"]}}
  const filters = ( <RemoteMultipleSelectFilters
    endpoint="run_data"
    fields={['mlwh_platform_type', 'tester']}
    globalFilters={globalFilters}
    setGlobalFilters={setGlobalFilters}
    baseUrl={ env.TOL_DATA }
    />)
  const test = <CountWidget endpoint='run_data' defaultFilter={defaultFilter} globalFilters={globalFilters} baseUrl={env.TOL_DATA} title='test widget count'/>;
  return (
    <>
      <Widgets
        components={[filters]}
      />
      <Widgets
        components={[test, sunburst, chart, table, map]}
      />
    </>
  );
}

export default Sandbox;
