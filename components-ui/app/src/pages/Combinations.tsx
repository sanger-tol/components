/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from 'react';
import { RemoteTable,
  RemoteMultipleSelectFilters,
  RemoteBarChart,
  Row,
  CentreContents,
  env } from '../tol-ui/src';


function Combinations() {
  // initial state for global filters is temporary
  const [globalFilters, setGlobalFilters] = useState<object>({in_list: {}});
  const [combinedFilters, setCombinedFilters] = useState<object>({});

  return (
    <CentreContents>
      <Row className="mb-4">
        <RemoteMultipleSelectFilters
          endpoint="run_data"
          fields={['mlwh_platform_type', 'tester']}
          globalFilters={globalFilters}
          setGlobalFilters={setGlobalFilters}
          baseUrl={ env.TOL_DATA }
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
          xAxis="mlwh_start_date"
          interval="M"
          height={500}
          baseUrl={ env.TOL_DATA }
        />
      </Row>
      <Row>
        <RemoteTable
          id="combinations-table"
          endpoint="run_data"
          filter={combinedFilters}
          setFilter={setCombinedFilters}
          height={500}
          baseUrl={ env.TOL_DATA }
        />
      </Row>
    </CentreContents>
  );
}

export default Combinations;
