/*
 * SPDX-FileCopyrightText: 2023 Genome Research Ltd.
 *
 * SPDX-License-Identifier: MIT
 */

import { RemoteTable, env, useZone, Widgets } from '../tol-ui/src';


function Sandbox() {

  const runData = useZone({
    endpoint: 'run_data',
    baseUrl: env.TOL_DATA,
    components: [{id: 'table-example'}]
  });

  const table1 = (
    <div>
      <RemoteTable
        id="table-example"
        rowSelection
        pageSize={100}
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
        {...runData}
        height={500}
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
