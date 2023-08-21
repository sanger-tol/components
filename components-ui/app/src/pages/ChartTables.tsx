/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { CentreContents,
         RemoteBarChartTable } from '../tol-ui/src'


function ChartTables() {
  return (
    <div className="charts">
      <CentreContents>
        <RemoteBarChartTable
          stacked
          title="Run Data"
          endpoint="run_data"
          breakDownBy="mlwh_platform_type"
          xKey="mlwh_start_date"
          interval="M"
          filterInputFields={['mlwh_platform_type', 'tester']}
        />
      </CentreContents>
    </div>
  );
}

export default ChartTables;
