/*
 * SPDX-FileCopyrightText: 2023 Genome Research Ltd.
 *
 * SPDX-License-Identifier: MIT
 */

import { RemoteTable,
         Widgets,
         env } from '../tol-ui/src/index'
import { useState } from 'react'

function Sandbox() {
  const [ globalFilters, setGlobalFilters ] = useState<object>({})

  setGlobalFilters({})

  const table = (
    <RemoteTable
      endpoint="barcoding_run_data"
      filter={globalFilters}
      // defaultSort="sts_sample.sts_col_date"
      fields={{
        "bioscan_f_primary": {
          rename: "Family"
        },
        "bioscan_o_primary": {
          rename: "Order Group"
        },
        "bioscan_g_primary": {
          rename: "Genus"
        },
        "bioscan_s_primary": {
          rename: "Scientific Name"
        },
        "sts_sample.sts_col_date": {
          rename: "Sample Collection Date",
          sort: true
        }
      }}
      height={500}
      baseUrl={ env.TOL_DATA }
    />
  )

  return (
    <div className="bioscan-report-card">
      <Widgets
        title="Report Card"
        components={[table]}
      />
    </div>
  );
}
export default Sandbox;
