/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { RemoteObjectDetail, TOL_DS, useZone } from "../tol-ui/src";

export function Sandbox() {
  const speciesZone = useZone({
    objectType: "species",
    dataSource: TOL_DS,
    filter: {},
    components: [
      { id: "detail" },
    ],
  });

  return (
    <RemoteObjectDetail
      id="detail"
      defaultSortByAttribute="sts_common_name"
      height={500}
      showKeys={false}
      fields={{
        data: {
          sts_scientific_name: { position: "left" },
          sts_ready: { position: "right" },
          sts_genus: { position: "right" },
          goat_lineage: { position: "left" },
        },
        order: {
          active: ["sts_scientific_name", "sts_ready", "sts_genus", "goat_lineage"],
        },
      }}
      {...speciesZone}
    />
  );
}
