/*
 * SPDX-FileCopyrightText: 2023 Genome Research Ltd.
 *
 * SPDX-License-Identifier: MIT
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
  const defaultFilter = {
    in_list: {},
    and_: {
      "sts_sample.id": [{op: "exists"}],
      "sts_sample.sts_gal_name": [{op: "eq", negate: true, value: "UNIVERSITY OF LODZ"}]
    }
  };
  const [filter1, setFilter1] = useState<object>(defaultFilter);
  const [filter2, setFilter2] = useState<object>(defaultFilter);
  const [filter3, setFilter3] = useState<object>(defaultFilter);

  const filters = (
    <RemoteMultipleSelectFilters
      endpoint="barcoding_run_data"
      fields={[
        "bioscan_o",
        "bioscan_f",
        "bioscan_g",
        "bioscan_s",
        "sts_sample.sts_gal_name"
      ]}
      renamedFields={{
        "sts_sample.sts_gal_name": "Partner",
        "bioscan_o": "Order",
        "bioscan_g": "Genus",
        "bioscan_f": "Family",
        "bioscan_s": "Scientific Name"
      }}
      globalFilters={filter1}
      setGlobalFilters={setFilter1}
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
          "bioscan_o",
          "bioscan_f",
          "bioscan_g",
          "bioscan_s"
        ]}
        filter={filter1}
        setCombinedFilters={setFilter2}
        baseUrl={env.TOL_DATA}
        legendPosition="right"
        noLabel
        height={450}
      />
    </span>
  );

  const chart = (
    <RemoteBarChart
      stacked
      endpoint="barcoding_run_data"
      breakDownBy="bioscan_o"
      xAxis="sts_sample.sts_col_date"
      interval="M"
      filter={filter2}
      setCombinedFilters={setFilter3}
      type='date'
      baseUrl={env.TOL_DATA}
      shortDate
    />
  );

  const map = (
    <RemoteBubbleMap
      endpoint="barcoding_run_data"
      longitudeKey="sts_sample.sts_longitude.keyword"
      latitudeKey="sts_sample.sts_latitude.keyword"
      filter={filter3}
      baseUrl={env.TOL_DATA}
      attributeKeys="bioscan_s"
    />
  );

  const table = (
    <RemoteTable
      id="report-card-v4"
      endpoint="barcoding_run_data"
      filter={filter3}
      defaultSort="bioscan_specimen.id"
      baseUrl={env.TOL_DATA}
      fields={{
        "bioscan_specimen.id": {
          rename: "Specimen ID",
          cellRenderer: null
        },
        "sts_sample.id": {
          rename: "Sample",
          width: 150,
          cellRenderer: null
        },
        "bioscan_c": {
          rename: "Class",
        },
        "bioscan_o": {
          rename: "Order"
        },
        "bioscan_f": {
          rename: "Family"
        },
        "bioscan_g": {
          rename: "Genus"
        },
        "bioscan_s": {
          rename: "Scientific Name"
        },
        "bioscan_id_similarity": {
          rename: "Percent ID Similarity"
        },
        "bioscan_rep_count": {
          rename: "n_reads",
          width: 150
        },
        "sts_sample.sts_latitude": {
          rename: "Latitude",
          type: "str",
          filterType: "str",
          width: 150
        },
        "sts_sample.sts_longitude": {
          rename: "Longitude",
          type: "str",
          filterType: "str",
          width: 150
        },
        "sts_sample.sts_col_date": {
          rename: "Collection Date",
          cellRenderer: "datetime",
          type: "datetime",
          filterType: "datetime"
        },
        "sts_sample.sts_PREDICTED_ORDER_OR_GROUP": {
          rename: "Predicted Order Or Group",
          type: "str",
          filterType: "str"
        },
        "bioscan_run": {
          rename: "Run",
          hidden: true
        },
        "bioscan_sequence": {
          rename: "Sequence",
          hidden: true
        }
      }}
    />
  );

  const resetFiltersButton = (
    <Button
      className="m-1"
      style={{float: 'right'}}
      onClick={()=>{
        setFilter1(defaultFilter);
        setFilter2(defaultFilter);
        setFilter3(defaultFilter);
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

  const components = [
    {
      component: intro,
      type: 'full'
    },
    {
      component: filters,
      type: 'full'
    },
    {
      component: sunburst,
      type: 'full'
    },
    {
      component: chart,
      type: 'lg'
    },
    {
      component: map,
      type: 'lg'
    },
    {
      component: table,
      type: 'lg'
    },
  ];

  return (
    <div className="bioscan-report-card">
      <Widgets
        components={components}
      />
    </div>
  );
}

export default Sandbox;
