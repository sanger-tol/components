/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import { Button, RemoteTable, Widgets, useZone, TOL_DS } from "../tol-ui/src";


export function Tables() {
  const [forceUpdate, setForceUpdate] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const title = <h2>Tables</h2>;

  const runData = useZone({
    objectType: "run_data",
    dataSource: TOL_DS,
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

  function ExampleElement({ p1, p2 }) {
    //if (!p1 || !p2) return 'A PROP IS EMPTY!';
    return `${p1}: ${p2}`;
  }

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
              text: "Run Data",
            },
          }}
          cellRenderers={{
            exampleElement: ExampleElement,
          }}
          fields={{
            data: {
              mlwh_run_id: {
                rename: "Run ID",
              },
              "mlwh_species.sts_scientific_name": {
                rename: "Species",
                cellRenderer: null,
              },
              "mlwh_sequencing_request.id": {
                // give better example
                rename: "Sequencing Request",
                cellRenderer: {
                  type: "link",
                  props: {
                    url: "https://example.com/api/${mlwh_sequencing_request.id}",
                    text: "Type: ${mlwh_platform_type}",
                  }
                },
              },
              mlwh_run_complete: {
                //rename: "Complete Date",
              },
              mlwh_platform_type: {
                //rename: "Platform",
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
                cellRenderer: {
                  type: "integer",
                },
                rename: "Estimated Genome Size",
              },
              custom_field: {
                rename: "Custom Field",
                cellRenderer: {
                  type: "exampleElement",
                  props: {
                    p1: "${mlwh_species.sts_scientific_name}",
                    p2: "Custom Field",
                  }
                },
              },
            },
            order: {
              active: [
                "mlwh_run_id",
                "mlwh_species.sts_scientific_name",
                "mlwh_sequencing_request.id",
                "mlwh_run_complete",
                "mlwh_platform_type",
                "mlwh_instrument_model",
                "mlwh_position",
                "mlwh_tag_index",
                "tolqc_species.goat_genome_size",
                "custom_field",
              ],
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
