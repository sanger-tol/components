/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from 'react';

import {
  ResponsiveWidget,
  RemoteBarChart,
  RemoteTable,
  env,
  Button,
  Widgets,
  Row,
  Col
} from '../tol-ui/src';


function Sandbox() {

  const [combinedFilters, setCombinedFilters] = useState<object>({}); // eslint-disable-line
  const [tableFilter, setTableFilter] = useState<object>({});// eslint-disable-line
  const [draggable, setDraggable] = useState(false);
  const [globalFilters, setGlobalFilters] = useState<object>({// eslint-disable-line
    in_list: {}
  });

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
      height={600}
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
      height={600}
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

  const table2 = (
    <RemoteTable
      id="report-card-v3"
      endpoint="barcoding_run_data"
      filter={tableFilter}
      defaultSort="sts_sample.sts_col_date"
      height={200}
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

  const DraggableButton = (
    <Button
      className="m-2"
      style={{float: 'right'}}
      onClick={()=>{
        setDraggable(!draggable);
      }}
    >
      Re-arrange
    </Button>
  );


  const components = [
    {
      'component': table2,
      'width': 4
    },
    {
      'component': table,
      'width': 4
    },
    {
      'component': table2,
      'width': 2
    },
    //{
    //  'component': chart,
    //  'width': 2
    // },
    {
      'component': table2,
      'width': 2
    },
    //{
    // 'component': table2,
    // 'width': 2
    //},
    {
      'component': chart,
      'width': 4
    },
    {
      'component': table2,
      'width': 3
    },
    {
      'component': table2,
      'width': 3
    },
    {
      'component': table,
      'width': 1
    }
  ];

  const title = (
    <span>
      <h2>Report Card</h2>
    </span>
  );

  const intro = (
    <Row>
      <Col xs={12} sm={8}>{title}</Col>
      <Col xs={12} sm={4}>{DraggableButton}</Col>
    </Row>
  );

  return (
    <div>
      <Widgets components={[intro]}/>
      <ResponsiveWidget components={components} draggable={draggable}/>
    </div>
  );
}

export default Sandbox;
