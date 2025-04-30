/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import { Button, RemoteTable, Widgets, env, useZone } from "../tol-ui/src";

interface exampleProps {
  text: string;
  mlwhTag: string;
}

function exampleElement(props: exampleProps) {
  const { text, mlwhTag } = props;
  return `${text}: ${mlwhTag}`;
}

function Tables() {
  const [forceUpdate, setForceUpdate] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const title = <h2>Tables</h2>;

  const runData = useZone({
    endpoint: "run_data",
    baseUrl: env.TOL_DATA,
    components: [{ id: "table-example" }],
  });

  const actions = [
    // remote version
    "super fun EXPORT",
    // custom version
    {
      name: "Custom Example",
      action: (selectedRows: string[]) => {
        console.log('This is a fully custom action');
        console.log(selectedRows);
        // set to a certain id
        setSelectedRows(['14354_1#1']);
      },
    }
  ];

  const table1 = (
    <>
      <div style={{ paddingBottom: "12px" }}>
        <Button
          type="primary"
          onClick={() => setForceUpdate(!forceUpdate)}
          text="Force Update"
        />
      </div>
      <div>
        <RemoteTable
          id="table-example"
          rowSelection
          pageSize={100}
          forceUpdate={forceUpdate}
          selectedRows={selectedRows}
          setSelectedRows={setSelectedRows}
          utilityBarConfig={{
            title: {
              title: "Run Data",
            },
          }}
          fields={{
            mlwh_run_id: {
              rename: "Run ID",
            },
            "mlwh_species.sts_scientific_name": {
              rename: "Species",
              cellRenderer: null,
            },
            "mlwh_sequencing_request.id": {
              rename: "Sequencing Request",
            },
            mlwh_run_complete: {
              rename: "Complete Date",
            },
            mlwh_platform_type: {
              rename: "Platform",
            },
            mlwh_instrument_model: {
              rename: "Instrument",
            },
            mlwh_position: {
              rename: "Position",
              filter: "boolean",
            },
            mlwh_tag_index: {
              rename: "Tag",
              filter: null,
              sort: false,
            },
            "tolqc_species.goat_genome_size": {
              cellRenderer: "integer",
              rename: "Estimated Genome Size",
            },
            custom_field: {
              rename: "Custom Field",
              cellRenderer: {
                element: exampleElement,
                propPointers: {
                  mlwhTag: "mlwh_tag_index",
                },
                props: {
                  text: "Custom Field",
                }
              },
              custom: true
            },
          }}
          height={500}
          actions={actions}
          {...runData}
        />
      </div>
    </>
  );

  const components = [
    {
      component: title,
      type: "full",
    },
    {
      component: table1,
      type: "full",
    },
  ];

  return <Widgets components={components} />;
}

export default Tables;
