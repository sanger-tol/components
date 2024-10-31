/*
 * SPDX-FileCopyrightText: 2023 Genome Research Ltd.
 *
 * SPDX-License-Identifier: MIT
 */

import { RemoteTable, Widgets, env, useZone } from '../tol-ui/src';


function Sandbox() {

  const runData = useZone({
    endpoint: 'run_data',
    baseUrl: env.TOL_DATA,
    components: [{id: 'table-example'}]
  });

  const table1 = (
    <div>
      <h5 style={{marginBottom: 12}}>Remote Table</h5>
      <RemoteTable
        id="table-example"
        rowSelection
        pageSize={100}
        displaySource
        fields={{
          "mlwh_run_id": {
            rename: "Run ID"
          },
          "mlwh_species.sts_scientific_name": {
            rename: "Species",
            cellRenderer: null
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
            rename: "Position",
            filter: 'boolean'
          },
          "mlwh_tag_index": {
            rename: "Tag",
            filter: null,
            sort: false
          },
        }}
        height={500}
        {...runData}
      />
    </div>
  );

  const components = [
    {
      component: table1,
      type: 'full'
    },
  ];

  return (
    <Widgets
      components={components}
    />
  );
}

export default Sandbox;
