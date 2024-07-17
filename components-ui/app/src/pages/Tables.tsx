/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from 'react';
import { Button, RemoteTable, Widgets, env, useZone } from '../tol-ui/src';


interface exampleProps {
  mlwhTag: string
}

function exampleElement(props: exampleProps) {
  const { mlwhTag } = props;
  return 'CUSTOM FIELD: ' + mlwhTag;
}

function Tables() {
  const [forceUpdate, setForceUpdate] = useState(false);

  const runData = useZone({
    endpoint: 'run_data',
    baseUrl: env.TOL_DATA,
    components: [{id: 'table-example'}]
  });

  const table = (
    <div>
      <h2 style={{marginBottom: 12}}>Tables</h2>
      <Button
        style={{marginBottom: 12}}
        onClick={() => setForceUpdate(!forceUpdate)}
      >
        Force Update
      </Button>
      <RemoteTable
        id="table-example"
        rowSelection
        forceUpdate={forceUpdate}
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
          "custom_field": {
            rename: "Custom Field",
            cellRenderer: {
              element: exampleElement,
              propPointers: {
                mlwhTag: "mlwh_tag_index"
              }
            }
          }
        }}
        height={500}
        {...runData}
      />
    </div>
  );

  const db = useZone({
    endpoint: 'singular',
    components: [{id: 'db-table'}]
  });

  const dbTable = (
    <div>
      <RemoteTable
        id="db-table"
        height={500}
        {...db}
      />
    </div>
  );

  const components = [
    {
      component: table,
      type: 'full'
    },
    {
      component: dbTable,
      type: 'full'
    }
  ];

  return (
    <Widgets
      components={components}
    />
  );
}

export default Tables;
