/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from 'react';

import {
  ResponsiveWidget,
  RemoteBarChart,
  RemoteTable,
  env
} from '../tol-ui/src';


function Sandbox() {

  const [combinedFilters, setCombinedFilters] = useState<object>({});
  const [tableFilter, setTableFilter] = useState<object>({});
  const [globalFilters, setGlobalFilters] = useState<object>({
    in_list: {}
  });

  const title = (
    <span>
      <h2>Report Card</h2>
    </span>
  );

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
  );

  const table = (
    <RemoteTable
      id="report-card-v3"
      endpoint="barcoding_run_data"
      filter={tableFilter}
      defaultSort="sts_sample.sts_col_date"
      height={500}
      baseUrl={env.TOL_DATA}
      fields={{
        "sts_sample.sts_gal_name": {
          rename: "Partner"
        },
        "bioscan_run_primary": {
          rename: "Batch"
        },
        "bioscan_specimen.id": {
          rename: "Specimen ID"
        },
        "bioscan_read_count": {
          rename: "Reads"
        },
        "bioscan_reads_in_contigs": {
          rename: "Read in Contigs"
        },
        "bioscan_contigs_produced": {
          rename: "Contigs"
        },
        "bioscan_rep_count_primary": {
          rename: "Reads in BIN"
        },
        "bioscan_id_similarity_primary": {
          rename: "% Match to BIN"
        },
        "bioscan_pred_tax": {
          rename: "Predicted Taxonomy"
        }
      }}
    />
  );

  const components = [
    {
     'component': title,
     'type': 'bar'
    },
    {
     'component': chart,
     'type': 'bar'
    },
    {
     'component': table,
     'type': 'table'
    },
  ]

  return (
    <ResponsiveWidget components={components}/>
  );
}

export default Sandbox;
