/*
 * SPDX-FileCopyrightText: 2023 Genome Research Ltd.
 *
 * SPDX-License-Identifier: MIT
 */

import {
  RemoteBarChart,
  RemoteSunburst,
  Widgets,
  env } from '../tol-ui/src';
import { useState } from 'react';


function Sandbox() {

  const [combinedFilters, setCombinedFilters] = useState<object>({});

  //const filters = (
  //  <RemoteMultipleSelectFilters
  //    endpoint="barcoding_run_data"
  //    fields={[
  //      "bioscan_o_primary",
  //      "bioscan_f_primary",
  //      "bioscan_g_primary",
  //      "bioscan_s_primary",
  //      "sts_sample.sts_gal"
  //    ]}
  //    renamedFields={{
  //      "sts_sample.sts_gal": "Partner",
  //      "bioscan_o_primary": "Order",
  //      "bioscan_g_primary": "Genus",
  //      "bioscan_f_primary": "Family",
  //      "bioscan_s_primary": "Scientific Name"
  //    }}
  //    globalFilters={globalFilters}
  //    setGlobalFilters={setGlobalFilters}
  //    baseUrl={env.TOL_DATA}
  //  />
  //)

  const chart = (
    <RemoteBarChart
      stacked
      title="Samples Recieved"
      endpoint='sample'
      breakDownBy="sts_ac_status"
      xAxis="benchling_date_sample_received_at_sanger"
      interval="M"
      setCombinedFilters={setCombinedFilters}
      type='date'
      height={500}
      baseUrl={env.TOL_DATA}
    />
  );

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
        sliceBy={[
          "bioscan_o_primary",
          "bioscan_f_primary",
          "bioscan_g_primary",
          "bioscan_s_primary"
        ]}
        filter={combinedFilters}
        height={600}
        baseUrl={env.TOL_DATA}
        legendPosition="right"
        noLabel
      />
    </span>
  );

  return (
    <div className="bioscan-report-card">
      <Widgets
        components={[chart]}
      />
      <Widgets
        components={[sunburst]}
      />
    </div>
  );
}
export default Sandbox;
