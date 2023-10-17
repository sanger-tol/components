Sandbox

/*
 * SPDX-FileCopyrightText: 2023 Genome Research Ltd.
 *
 * SPDX-License-Identifier: MIT
 */

import { RemoteBarChart,
         RemoteTable,
         RemoteMultipleSelectFilters,
         Widgets,
         Button,
         env } from '../tol-ui/src/index'

import { useState } from 'react'

function Sandbox() {

  const [ globalFilters, setGlobalFilters ] = useState<object>({})
  const [ combinedFilters, setCombinedFilters ] = useState<object>({})

  const filters = (
    <RemoteMultipleSelectFilters
      endpoint="barcoding_run_data"
      fields={[
        "bioscan_o_primary","bioscan_f_primary",
        "bioscan_g_primary", "bioscan_s_primary","sts_sample.sts_gal"
      ]}
      renamedFields={{"sts_sample.sts_gal": "Partner", "bioscan_o_primary": " Order",
        "bioscan_g_primary": "Genus", "bioscan_f_primary": "Family",
        "bioscan_s_primary": "Scientific Name"
      }}
      globalFilters={globalFilters}
      setGlobalFilters={setGlobalFilters}
      baseUrl={ env.TOL_DATA }
      dependentFilters
    />
  )

  const chart = (
    <RemoteBarChart
      stacked
      title=""
      endpoint="barcoding_run_data"
      breakDownBy="bioscan_o_primary"
      xAxis="sts_sample.sts_col_date"
      interval="M"
      filter={globalFilters}
      setCombinedFilters={setCombinedFilters}
      type='date'
      height={500}
      baseUrl={ env.TOL_DATA }
      shortDate
    />
  )

  const table = (
    <RemoteTable
      id="sandbox-3"
      endpoint="barcoding_run_data"
      filter={combinedFilters}
      defaultSort="sts_sample.sts_col_date"
      fields={{
        "sts_specimen.id": {
          rename: "Specimen ID"
        },
        "bioscan_o_primary": {
          rename: "Order"
        },
        "bioscan_f_primary": {
          rename: "Family"
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

  const resetFiltersButton = (
    <Button className="m-1" onClick={()=>{setGlobalFilters({in_list:  {}})}}>Reset Filters</Button>
  )

  return (
    <div className="sequencing-runs">
      <Widgets
        components={[resetFiltersButton]}
      />
      <Widgets
        title="Report Card"
        components={[filters, chart, table]}
      />
    </div>
  );
}
export default Sandbox;

