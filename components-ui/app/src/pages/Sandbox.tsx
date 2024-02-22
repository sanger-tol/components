/*
 * SPDX-FileCopyrightText: 2023 Genome Research Ltd.
 *
 * SPDX-License-Identifier: MIT
 */

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
  Col,
  RemoteSunburst
} from '../tol-ui/src';


function Sandbox() {

  const [combinedFilters, setCombinedFilters] = useState<object>({});
  // @ts-ignore
  const [tableFilter, setTableFilter] = useState<object>({});// eslint-disable-line
  const [draggable, setDraggable] = useState(false);
  // @ts-ignore
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
      height={150}
      baseUrl={ env.TOL_DATA }
      shortDate
    />
  );

  //const sunburst = (
  //  <span>
  //    <h6>
  //      BIOSCAN Sunburst of Specimens:
  //    </h6>
  //    <p className="mb-3">
  //      Subset to different taxonomic levels or Partners by using the menu above.
  //      This will also subset the barchart, map, and table below.
  //    </p>
  //    <RemoteSunburst
  //      endpoint="barcoding_run_data"
  //      sliceBy={[
  //        "bioscan_o_primary",
  //        "bioscan_f_primary",
  //        "bioscan_g_primary",
  //        "bioscan_s_primary"
  //      ]}
  //      filter={combinedFilters}
  //      height={600}
  //      baseUrl={env.TOL_DATA}
  //      legendPosition="right"
  //      noLabel
  //    />
  //  </span>
  //);

  const sunburst2 = (
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
  );

  const chart2 = (
    <RemoteBarChart
      stacked
      endpoint="barcoding_run_data"
      breakDownBy="bioscan_o_primary"
      xAxis="sts_sample.sts_col_date"
      interval="M"
      filter={globalFilters}
      setCombinedFilters={setCombinedFilters}
      type='date'
      height={150}
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
      height={150}
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
      height={150}
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
      'component': chart,
      'width': 1
    },
    {
      'component': table,
      'width': 1
    },
    {
      'component': chart2,
      'width': 1
    },
    {
      'component': table2,
      'width': 1
    },
    {
      'component': sunburst2,
      'width': 4
    },
    //{
    //  'component': sunburst,
    //  'width': 4
    //},
    //{
    //  'component': table2,
    //  'width': 2
    //},
    //{
    //  'component': table,
    //  'width': 4
    //}
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

function generateIlluminaTable(filter: object) {
  return (
    <div>
      <h5>Illumina Run Data</h5>
      <p className='mb-3'>Information for each Illumina sequencing run collected for this species.</p>
      <RemoteTable
        id="illumina-run-detail-table"
        endpoint="run_data"
        baseUrl={env.TOL_DATA}
        filter={filter}
        height={300}
        fields={{
          "mlwh_pipeline_id_lims": {
            rename: "Pipeline"
          },
          "mlwh_tolid.id": {
            rename: "ToLID"
          },
          "mlwh_run_complete": {
            rename: "Run Complete Date"
          },
          "mlwh_run_id": {
            rename: "Run ID"
          },
          // "": {
          //     rename: "Read Pairs"
          // },
          // "": {
          //     rename: "Yield"
          // },
          "mlwh_biosample_accession": {
            rename: "Sample Accession"
          },
          // "": {
          //     rename: "Run Accession"
          // },
          // "mlwh_run_status": {
          //     rename: "Run Status"
          // },
          // "": {
          //     rename: "Barcode"
          // },
        }}
      />
    </div>
  );
}

function Sandbox() {
  const id = 1155244;
  const [response, setResponse] = useState();
  const iseqRunFilter = {exact: {'mlwh_species.id': id, 'mlwh_platform_type': 'Illumina'}};

  if (response === null) {
    return (
      <Header
        title="Species not found."
        pageEmpty
      />
    );
  }
  if (response === undefined) {
    return (
      <RemoteGet
        endpoint={'species/' + id}
        baseUrl={env.TOL_DATA}
        response={response}
        setResponse={setResponse}
      />
    );
  } else {
    const attributes = response!['data']['data']['attributes'];
    const detail = generateDetail(attributes);

    return (
      <div className="species-detail">
        <Widgets
          components={[detail]}
        />
        <Widgets
          components={[generateIlluminaTable(iseqRunFilter)]}
        />
      </div>
    );
  }
}
export default Sandbox;
