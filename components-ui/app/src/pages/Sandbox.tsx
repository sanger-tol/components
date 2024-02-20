/*
 * SPDX-FileCopyrightText: 2023 Genome Research Ltd.
 *
 * SPDX-License-Identifier: MIT
 */

import { Header, ObjectDetail, RemoteGet, RemoteTable, Widgets, env } from '../tol-ui/src';
import { useState } from 'react';


function generateDetail(attributes: any) {
  return (
    <div>
      <h1 className='mb-3'>{(attributes as any)['sts_scientific_name']}</h1>
      <ObjectDetail
        data={{
          "Taxonomy ID": attributes['uid'],
          "Order": attributes['sts_order_group'],
          "Family": attributes['sts_family'],
          "Genome Size": attributes['sts_genome_size'],
          "ToLID Prefix": attributes['sts_prefix'],
        }}
      />
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
