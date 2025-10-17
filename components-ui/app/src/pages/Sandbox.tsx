/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useZone, TOL_DS, RemoteTable, Image } from "../tol-ui/src";

export function Sandbox() {
  const sample = useZone({
    objectType: "sample",
    dataSource: TOL_DS,
    components: [{ id: "table-example" }],
  });

  return (
    <>
      <RemoteTable
        groupBy={true}
        id="table-example"
        rowSelection
        pageSize={100}
        utilityBarConfig={{
          title: {
            text: "Curation",
          },
        }}
        cellRenderers={{
          'image': Image
        }}
        fields={{
          data: {
            "bioscan_image_url": {
              cellRenderer: {
                type: 'image',
                props: {
                  value: '${bioscan_image_url}',
                  names: '${bioscan_image_url}',
                }
              }
            },
          },
          order: {
            active: ['bioscan_image_url'],
          }
        }}
        height={500}
        {...sample} />
    </>);
}
