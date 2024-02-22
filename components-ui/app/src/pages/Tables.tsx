/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { RemoteTable, Widgets, env } from '../tol-ui/src';


function Tables() {
  const table1 = (
    <RemoteTable
      id="run-data-table-v2"
      endpoint="run_data"
      height={500}
      fields={{
        "mlwh_run_id": {
          rename: "Run ID"
        },
        "mlwh_species.sts_scientific_name": {
          rename: "Species",
          cellRenderer: "relationshipDetail"
        },
        "mlwh_sequencing_request.id": {
          rename: "Sequencing Request"
        },
        "mlwh_run_complete": {
          rename: "Complete Date"
        },
        "mlwh_platform_type": {
          rename: "Platform"
        },
        "mlwh_instrument_model": {
          rename: "Instrument"
        },
        "mlwh_position": {
          rename: "Position"
        },
        "mlwh_tag_index": {
          rename: "Tag"
        }
      }}
      baseUrl={env.TOL_DATA}
    />
  );

  const table2 = (
    <RemoteTable
      basic
      id="species-basic-v1"
      endpoint="species"
      height={500}
      fields={{
        uid: {
          type: "str"
        },
        sts_genus: {
          type: "str"
        }
      }}
      baseUrl={env.TOL_DATA}
    />
  );

  return (
    <div className="tables">
      <Widgets
        title='RemoteTable'
        components={[table1]}
      />
      <Widgets
        title='Basic RemoteTable'
        components={[table2]}
      />
    </div>
  );
}

export default Tables;
