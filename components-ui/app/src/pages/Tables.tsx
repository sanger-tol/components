/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { RemoteTable, Widgets, env, useZone } from '../tol-ui/src';


interface exampleProps {
  mlwhTag: string
}

function exampleElement(props: exampleProps) {
  const { mlwhTag } = props;
  return 'CUSTOM FIELD: ' + mlwhTag;
}

function Tables() {
  const runData = useZone({
    endpoint: 'run_data',
    baseUrl: env.TOL_DATA,
    components: [{id: 'table-example'}]
  });

  const table = (
    <div>
      <h2 style={{marginBottom: 12}}>Tables</h2>
      <RemoteTable
        id="table-example"
        rowSelection
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

  const components = [
    {
      component: table,
      type: 'full'
    }
  ];

  return (
    <div>
      <Widgets
        components={components}
      />
    </div>
  );
}

export default Tables;
