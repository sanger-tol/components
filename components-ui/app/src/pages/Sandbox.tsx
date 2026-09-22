/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { RemoteObjectDetail, RemoteTable, Widgets, useZone, TOL_DS } from "../tol-ui/src";

export function Sandbox() {
  const sp = useZone({
    objectType: "species",
    dataSource: TOL_DS,
    components: [
      {
        id: "remote-table-example",
        filter: {
          and_: {
            "id": { "contains": { "value": 1002971 } },
            "sts_scientific_name": {
              "exists": {}
            }
          }
        }
      },
      { id: "remote-object-detail-example" },
    ],
  });

  const remoteObjectDetail = (
    <RemoteObjectDetail
      {...sp}
      id="remote-object-detail-example"
      fields={{
        order: {
          active: [
            "id",
            "sts_sample_sts_project_union",
            "sts_scientific_name"
          ],
        },
      }}
    />
  );

  const remoteTable = (
    <RemoteTable
      {...sp}
      id="remote-table-example"
      fields={{
        order: {
          active: [
            "id",
            "sts_scientific_name",
            "sts_sample_sts_project_union"
          ],
        },
      }}
    />
  );

  const components = [
    {
      component: remoteTable,
      type: "md",
    },
    {
      component: remoteObjectDetail,
      type: "md",
    },
  ];

  return <Widgets components={components} />;
}

