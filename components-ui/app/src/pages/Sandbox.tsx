/*
 * SPDX-FileCopyrightText: 2023 Genome Research Ltd.
 *
 * SPDX-License-Identifier: MIT
 */

import { RemoteTable,
  RemoteMultipleSelectFilters,
  RemoteBarChart,
  Widgets,
  env } from '../tol-ui/src';
import { useState } from 'react';


function Sandbox() {
  const [globalFilters, setGlobalFilters] = useState<object>({in_list: {}});
  const [combinedFilters, setCombinedFilters] = useState<object>({});

  const filters = (
    <RemoteMultipleSelectFilters
      endpoint="sequencing_request"
      fields={["benchling_source"]}
      globalFilters={globalFilters}
      setGlobalFilters={setGlobalFilters}
      baseUrl={env.TOL_DATA}
    />
  );

  const chart = (
    <RemoteBarChart
      stacked
      title="Submission from Benchling to SciOps"
      endpoint="sequencing_request"
      breakDownBy="benchling_source"
      xAxis="benchling_completion_date"
      interval="M"
      filter={globalFilters}
      setCombinedFilters={setCombinedFilters}
      type='date'
      height={500}
      baseUrl={env.TOL_DATA}
    />
  );

  const table = (
    <RemoteTable
      id="sequencing-request-table-v2"
      endpoint="sequencing_request"
      filter={combinedFilters}
      setFilter={setCombinedFilters}
      defaultSort="mlwh_species.sts_scientific_name"
      fields={{
        "uid": {
          rename: "Sample Ref"
        },
        "benchling_sequencing_platform": {
          rename: "Platform (Benchling)",
        },
        "mlwh_species.sts_scientific_name": {
          rename: "Species",
          cellRenderer: "relationshipDetail"
        },
        "benchling_tolid.id": {
          rename: "ToLID (Benchling)"
        },
        "benchling_source": {
          rename: "Source (Benchling)"
        },
        "benchling_completion_date": {
          rename: "Completion Date (Benchling)"
        },
        "portaldb_date_sent_to_sciops": {
          rename: "Date Sent To SciOps"
        }
      }}
      height={500}
      baseUrl={env.TOL_DATA}
    />
  );

  return (
    <div className="sequencing-requests">
      <Widgets
        title="Sequencing Requests"
        components={[filters]}
      />
      <Widgets
        components={[chart]}
      />
      <Widgets
        components={[table]}
      />
    </div>
  );
}
export default Sandbox;
