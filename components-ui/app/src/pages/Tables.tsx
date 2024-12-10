/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from 'react';
import { Button, RemoteTable, Widgets, env, useZone } from '../tol-ui/src';
import { DropdownButtonProps } from '../tol-ui/src/board/components/DropdownButtons';

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

  // Example of passing context to table dropdown buttons
  const dropdownButtons: DropdownButtonProps[] = [
    {
      dropdownButtonName: "Log Rows",
      action: (context) => {
        outputTableData(context!.selectedRows, undefined);
      }
    },
    {
      dropdownButtonName: "Log Filter",
      action: (context) => {
        outputTableData(undefined, context!.filter);
      }
    },
    {
      dropdownButtonName: "Log Both",
      action: (context) => {
        outputTableData(context!.selectedRows, context!.filter);
      }
    }
  ]

  const table1 = (
    <div>
      <Button
        style={{marginBottom: 12}}
        onClick={() => setForceUpdate(!forceUpdate)}
      >
        Force Update
      </Button>
      <h5 style={{marginBottom: 12}}>Remote Table</h5>
      <RemoteTable
        id="table-example"
        rowSelection
        //pageSize={100}
        forceUpdate={forceUpdate}
        dropdownButtons={dropdownButtons}
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
