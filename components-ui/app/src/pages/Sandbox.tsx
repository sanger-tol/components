/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { RemoteTable, Widgets, useZone } from "../tol-ui/src";

function Sandbox() {
  const actions = [
    "auth-required-flow",
    {
      dropdownButtonName: "succeed",
      action: (selectedRows: string[]) => {
        console.log(selectedRows);
      },
    },
    {
      dropdownButtonName: "fail... deliberately",
      action: () => {
        throw "this is an example error in the console.";
      },
    },
  ];

  const sample = useZone({
    endpoint: "sample",
    // baseUrl: env.TOL_DATA,
    components: [{ id: "table-example-2" }],
  });

  const table2 = (
    <div>
      <h5 style={{ marginBottom: 12 }}>Remote Table Empty On Load</h5>
      <RemoteTable
        id="table-example-2"
        height={500}
        {...sample}
        actions={["super fun EXPORT", "Insert into Benchling Tissue Work List"]}
        rowSelection
      />
    </div>
  );

  const components = [
    {
      component: table2,
      type: "full",
    },
  ];

  return <Widgets components={components} />;
}

export default Sandbox;
