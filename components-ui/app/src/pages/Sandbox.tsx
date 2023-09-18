/*
 * SPDX-FileCopyrightText: 2023 Genome Research Ltd.
 *
 * SPDX-License-Identifier: MIT
 */

import { RemoteTable,
         Widgets,
         env } from '../tol-ui/src/index'


function Sandbox() {
  const table = (
    <RemoteTable
      endpoint="sequencing_request"
      baseUrl={ env.TOL_DATA }
      defaultSort="benchling_source"
      fields={{
        "uid": {
          rename: "Sample Ref"
        },
        "benchling_sequencing_platform": {
          rename: "Platform (Benchling)"
        },
        "benchling_tolid": {
          rename: "ToLID (Benchling)"
        },
        "benchling_source": {
          rename: "Source (Benchling)"
        },
        "benchling_eln_submission_date": {
          rename: "Submission Date (Benchling)"
        },
        "benchling_species.sts_scientific_name": {
          rename: "Benchling Species",
          relationshipBox: true
        }
      }}
      height={500}
    />
  )

  return (
    <div className="sequencing-runs">
      <Widgets
        components={[ table]}
      />
    </div>
  );
}
export default Sandbox;
