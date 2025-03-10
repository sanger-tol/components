/*
 * SPDX-FileCopyrightText: 2023 Genome Research Ltd.
 *
 * SPDX-License-Identifier: MIT
 */

import { RemoteTable, Widgets, useZone, env} from '../tol-ui/src';

function Sandbox() {
  const extractions = useZone({
    endpoint: 'extraction',
    baseUrl: env.TOL_DATA,
    components: [
      { id: 'extractions-table-v2' }
    ]
  });

  const table = (
    <RemoteTable
      id="extractions-table-v2"
      defaultSort="benchling_species.sts_scientific_name"
      displaySource
      fields={{
        "uid": {
          rename: "Identifier"
        },
        "benchling_species.sts_scientific_name": {
          rename: "Species",
          cellRenderer: "relationshipDetail"
        },
        "benchling_tolid.id": {
          rename: "ToLID (Benchling)"
        },
        "benchling_completion_date": {
          rename: "Date Completed (Benchling)",
          sort: true
        }
      }}
      {...extractions}
    />
  );

  const title = (
    <div>
      <h2>Extractions</h2>
    </div>
  );

  const components = [
    {
      component: title,
      type: 'full'
    },
    {
      component: table,
      type: 'lg'
    },
  ];

  return (
    <div className="extractions">
      <Widgets
        components={components}
      />
    </div>
  );
}
export default Sandbox;
