/*
 * SPDX-FileCopyrightText: 2023 Genome Research Ltd.
 *
 * SPDX-License-Identifier: MIT
 */

import { RemoteTable,
  RemoteMultipleSelectFilters,
  RemoteBarChart,
  RemoteBubbleMap,
  RemoteSunburst,
  Button,
  Widgets,
  Row,
  Col,
  env } from '../tol-ui/src/index'

import { useState } from 'react'

function Sandbox() {
  const [ globalFilters, setGlobalFilters ] = useState<object>({in_list:{}})
  const [ combinedFilters, setCombinedFilters ] = useState<object>({})

  console.log(globalFilters)

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
      id="report-card-v2"
      endpoint="barcoding_run_data"
      filter={combinedFilters}
      defaultSort="sts_sample.sts_col_date"
      fields={{
        "sts_specimen.id": {
          rename: "Specimen ID"
        },
        "sts_sample.sts_gal": {
          rename: "Partner"
        },
        "sts_sample.sts_col_date": {
          rename: "Sample Collection Date"
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
        "sts_sample.sts_latitude": {
          rename: "Latitude"
        },
        "sts_sample.sts_longitude": {
          rename: "Longitude"
        }
      }}
      height={500}
      baseUrl={ env.TOL_DATA }
      noConfigModal
    />
  )

  const map = (
    <RemoteBubbleMap
      endpoint="barcoding_run_data"
      longitudeKey="sts_sample.sts_longitude.keyword"
      latitudeKey="sts_sample.sts_latitude.keyword"
      filter={combinedFilters}
      height={500}
      baseUrl={ env.TOL_DATA }
      attributeKeys="bioscan_s_primary"
    />
  )

  const sunburst = (
    <span>
      <h6>
        BIOSCAN Sunburst of Specimens:
      </h6>
      <p className="mb-3">
        Subset to different taxonomic levels or Partners by using the menu above.
        This will also subset the barchart, map, and table below.
      </p>
      <RemoteSunburst
        endpoint="barcoding_run_data"
        sliceBy={["bioscan_o_primary","bioscan_f_primary", "bioscan_g_primary", "bioscan_s_primary"]}
        filter={combinedFilters}
        height={600}
        baseUrl={ env.TOL_DATA }
        legendPosition="right"
        noLabel
      />
    </span>
  )

  const resetFiltersButton = (
    <Button className="m-1" style={{float: 'right'}} onClick={()=>{setGlobalFilters({in_list:  {}})}}>Reset Filters</Button>
  )

  const title = (
    <span>
      <h2>Report Card</h2>
    </span>
  )

  const intro = (
    <Row>
      <Col xs={12} sm={8}>{title}</Col>
      <Col xs={12} sm={4}>{resetFiltersButton}</Col>
    </Row>
  )

  return (
    <div className="bioscan-report-card">
      <Widgets
        components={[intro]}
      />
      <Widgets
        components={[filters]}
      />
      <Widgets
        components={[sunburst]}
      />
      <Widgets
        components={[chart]}
      />
      <Widgets
        components={[map]}
      />
      <Widgets
        components={[table]}
      />
    </div>
  );
}
export default Sandbox;

