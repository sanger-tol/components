/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { CentreContents,
         RemoteChartTable } from '../tol-ui/src'


function ChartTables() {
  return (
    <div className="charts">
      <CentreContents>
        <RemoteChartTable
          stacked
          title="Run Data"
          endpoint="run_data"
          breakDownBy="mlwh_platform_type"
          xAxis="mlwh_start_date"
          interval="M"
          filterInputFields={['mlwh_platform_type', 'tester']}
        />
      </CentreContents>
    </div>
  );
}

export default ChartTables;
