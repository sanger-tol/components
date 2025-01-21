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

  const title = <h2>Tables</h2>;

  const runData = useZone({
    endpoint: 'run_data',
    baseUrl: env.TOL_DATA,
    components: [{id: 'table-example'}]
  });

  const outputTableData = (rows?: string[], filter?: any) => {
    rows && console.log("Selected rows:", rows);
    filter && console.log("Filter:", filter);
  }

  const actions = [
    'auth-required-flow',
    {
      dropdownButtonName: 'succeed',
      action: (selectedRows: string[]) => {
        console.log(selectedRows);
      }
    },
    {
      dropdownButtonName: 'fail... deliberately',
      action: () => {
        throw 'this is an example error in the console.'
      }
    },
  ];

  const table1 = (
    <>
    <div style={{paddingBottom: '12px'}}>
        <Button
          type='primary'
          onClick={() => setForceUpdate(!forceUpdate)}
          text='Force Update'
        />
        <h5 style={{marginBottom: 12}}>Remote Table</h5>
      </div>
    <div>
      <RemoteTable
        id="table-example"
        rowSelection
        //pageSize={100}
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
        actions={actions}
        {...runData}
      />
    </div>
    </>
  );

  const sample = useZone({
    endpoint: 'sample',
    baseUrl: env.TOL_DATA,
    components: [{id: 'table-example-2'}]
  });

  const table2 = (
    <div>
      <h5 style={{marginBottom: 12}}>Remote Table Empty On Load</h5>
      <RemoteTable
        id="table-example-2"
        height={500}
        {...sample}
      />
    </div>
  );


  const db = useZone({
    endpoint: 'singular',
    components: [{id: 'db-table'}]
  });

  const dbTable = (
    <div id="dbTable1">
      <h5 style={{marginBottom: 12}}>Remote Table Local Database</h5>
      <RemoteTable
        id="db-table"
        height={500}
        {...db}
      />
    </div>
  );

  const components = [
    {
      component: title,
      type: 'full'
    },
    {
      component: table1,
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
