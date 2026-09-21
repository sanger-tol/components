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
      { id: "remote-object-detail-example" },
      { id: "remote-table-example" },
    ],
    filter: {
      and_: {
        "sts_scientific_name": {
          "exists": {}
        }
      }
    }
  });

  const title = <h2>Remote Object Detail</h2>;

  const remoteObjectDetail = (
    <RemoteObjectDetail
      {...sp}
      id="remote-object-detail-example"
      fields={{
        order: {
          active: [
            "id",
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
            "sts_scientific_name"
          ],
        },
      }}
    />
  );

  const components = [
    {
      component: title,
      type: "full",
    },
    {
      component: remoteObjectDetail,
      type: "md",
    },
    {
      component: remoteTable,
      type: "md",
    },
  ];

  return <Widgets components={components} />;
}

