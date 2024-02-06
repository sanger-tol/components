/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  RemoteTable,
  RemoteMultipleSelectFilters,
  RemoteBarChart,
  RemoteBubbleMap,
  RemoteSunburst,
  Button,
  Widgets,
  Row,
  Col,
  env
} from '../tol-ui/src';
import { useState } from 'react';


function Sandbox() {
  // initial state for global filters is temporary
  const [globalFilter, setGlobalFilter] = useState<object>({in_list: {}});
  const [combinedFilter, setCombinedFilter] = useState<object>({});

  const filters = (
    <RemoteMultipleSelectFilters
      endpoint="barcoding_run_data"
      fields={[
        "bioscan_o_primary",
        "bioscan_f_primary",
        "bioscan_g_primary",
        "bioscan_s_primary",
        "sts_sample.sts_gal_name"
      ]}
      renamedFields={{
        "sts_sample.sts_gal_name": "Partner",
        "bioscan_o_primary": "Order",
        "bioscan_g_primary": "Genus",
        "bioscan_f_primary": "Family",
        "bioscan_s_primary": "Scientific Name"
      }}
      globalFilters={globalFilter}
      setGlobalFilters={setGlobalFilter}
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
        filter={globalFilter}
        height={600}
        baseUrl={env.TOL_DATA}
        legendPosition="right"
        noLabel
      />
    </span>
  );

  const chart = (
    <RemoteBarChart
      stacked
      endpoint="barcoding_run_data"
      breakDownBy="bioscan_o_primary"
      xAxis="sts_sample.sts_col_date"
      interval="M"
      filter={globalFilter}
      setCombinedFilters={setCombinedFilter}
      type='date'
      height={500}
      baseUrl={env.TOL_DATA}
      shortDate
    />
  );

  const map = (
    <RemoteBubbleMap
      endpoint="barcoding_run_data"
      longitudeKey="sts_sample.sts_longitude.keyword"
      latitudeKey="sts_sample.sts_latitude.keyword"
      filter={combinedFilter}
      height={500}
      baseUrl={env.TOL_DATA}
      attributeKeys="bioscan_s_primary"
    />
  );

  const table = (
    <RemoteTable
      id="report-card-v3"
      endpoint="barcoding_run_data"
      filter={combinedFilter}
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
        "bioscan_otu_primary": {
          rename: "Classification"
        },
        "bioscan_rep_count_primary": {
          rename: "Reads in BIN"
        },
        "bioscan_id_similarity_primary": {
          rename: "% Match to BIN"
        },
        "bioscan_pred_tax": {
          rename: "Predicted Taxonomy"
        },
        "bioscan_o_primary": {
          rename: "Primary Order (BOLD)"
        },
        "bioscan_other_orders": {
          rename: "Other Orders"
        },
        "bioscan_match": {
          rename: "Taxonomy Mismatch"
        },
        "bioscan_conservation_status": {
          rename: "Pantheon Conservation Status"
        }
      }}
    />
  );

  const resetFiltersButton = (
    <Button
      className="m-1"
      style={{float: 'right'}}
      onClick={()=>{
        setGlobalFilter({in_list: {}});
        setCombinedFilter({});
      }}
    >
      Reset Filters
    </Button>
  );

  const title = (
    <span>
      <h2>Report Card</h2>
    </span>
  );

  const intro = (
    <Row>
      <Col xs={12} sm={8}>{title}</Col>
      <Col xs={12} sm={4}>{resetFiltersButton}</Col>
    </Row>
  );

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
