/*
 * SPDX-FileCopyrightText: 2023 Genome Research Ltd.
 *
 * SPDX-License-Identifier: MIT
 */

import { RemoteBubbleMap,
         RemoteMultipleSelectFilters,
         Widgets,
         env } from '../tol-ui/src/index'
import { useState } from 'react'

function Sandbox() {
  const [ globalFilters, setGlobalFilters ] = useState<object>({})

  const filters = (
    <RemoteMultipleSelectFilters
      endpoint="barcoding_run_data"
      fields={[
        "sts_sample.sts_gal", "sts_sample.sts_col_date", "bioscan_o_primary",
        "bioscan_g_primary", "bioscan_f_primary", "bioscan_s_primary", 'sts_sample.sts_longitude'
      ]}
      renamed_fields={{"sts_sample.sts_gal": "GAL", "sts_sample.sts_col_date": "Date of Collection",
        "bioscan_o_primary": " Order Group", "bioscan_g_primary": "Genus", "bioscan_f_primary": "Family",
        "bioscan_s_primary": "Scientific Name"
      }}
      globalFilters={globalFilters}
      setGlobalFilters={setGlobalFilters}
      baseUrl={ env.TOL_DATA }
    />
  )

  const map = (
    <RemoteBubbleMap
      endpoint="barcoding_run_data"
      longitudeKey="sts_sample.sts_longitude.keyword"
      latitudeKey="sts_sample.sts_latitude.keyword"
      filter={globalFilters}
      height={500}
      baseUrl={ env.TOL_DATA }
    />
  )

  return (
    <div className="bioscan-report-card">
      <Widgets
        title="Report Card"
        components={[filters]}
      />
      <Widgets
        components={[map]}
      />
    </div>
  );
}
export default Sandbox;
