/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from 'react';
import {
  RemoteTable,
  RemoteMultipleSelectFilters,
  RemoteBarChart,
  RemoteSunburst,
  Row,
  Widgets,
  env
} from '../tol-ui/src';


function Combo() {
  // initial state for global filters is temporary
  const [globalFilters, setGlobalFilters] = useState<object>({in_list: {}});
  const [combinedFilters, setCombinedFilters] = useState<object>({});
  const [sunburstFilter, setSunburstFilter] = useState<object>({});

  const chartCombo = (
    <div>
      <Row className="mb-4">
        <RemoteMultipleSelectFilters
          endpoint="run_data"
          fields={['mlwh_platform_type', 'tester']}
          globalFilters={globalFilters}
          setGlobalFilters={setGlobalFilters}
          baseUrl={env.TOL_DATA}
        />
      </Row>
      <Row className="mb-4">
        <RemoteBarChart
          stacked
          title="Run Data"
          endpoint="run_data"
          filter={globalFilters}
          setCombinedFilters={setCombinedFilters}
          type="date"
          breakDownBy="mlwh_platform_type"
          xAxis="mlwh_run_complete"
          interval="M"
          height={500}
          baseUrl={env.TOL_DATA}
        />
      </Row>
      <Row>
        <RemoteTable
          id="species-combo-table-1"
          endpoint="run_data"
          filter={combinedFilters}
          height={500}
          baseUrl={env.TOL_DATA}
        />
      </Row>
    </div>
  );

  const sunburstCombo = (
    <div>
      <Row className="mb-4">
        <RemoteSunburst
          title="Species"
          endpoint="species"
          sliceBy={["sts_order_group", "sts_family"]}
          setCombinedFilters={setSunburstFilter}
          height={600}
          legendPosition="left"
          baseUrl={ env.TOL_DATA }
        />
      </Row>
      <Row>
        <RemoteTable
          id="species-combo-table-2"
          endpoint="species"
          defaultSort="sts_scientific_name"
          height={600}
          filter={sunburstFilter}
          fields={{
            "sts_scientific_name": {
              rename: "Scientific Name",
            },
            "sts_taxon_group": {
              rename: "Taxon Group"
            },
            "sts_family": {
              rename: "Family"
            },
            "sts_order_group": {
              rename: "Order"
            },
            "sts_prefix": {
              rename: "ToLID Prefix"
            },
          }}
          baseUrl={ env.TOL_DATA }
        />
      </Row>
    </div>
  );

  return (
    <div>
      <Widgets
        components={[chartCombo]}
      />
      <Widgets
        components={[sunburstCombo]}
      />
    </div>
  );
}

export default Combo;
