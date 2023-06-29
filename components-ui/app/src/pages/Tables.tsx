/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { CentreContents, AutoTable, InfoTooltip } from '../tol-ui/src'
// import StatusExample from '../tol-ui/src/sandbox/StatusExample'


function Tables() {
  return (
    <div className="tables">
      <CentreContents>
      <InfoTooltip
        contents="This is an example tooltip"
      />
      <AutoTable
        endpoint="treeofsex_species"
      />
      </CentreContents>
    </div>
  );
}

export default Tables;

/*
<AutoTable
  endpoint="samples"
  fields={{
    "id": {rename: "Row ID", sort: false},
    "tube_id": {
      cellRenderer: {
        element: StatusExample,
        propPointers: {
          param: "tube_id"
        }
      }
    },
    "specimens.tolid": {rename: "ToL ID Prefix"},
    "specimens.species.name": {rename: "Species"},
    "created_at": {rename: "Created At"},
    "specimens.species.scientific_name": {
      rename: "Species Tag",
      cellRenderer: {
        element: StatusExample,
        propPointers: {
          param: "specimens.species.id"
        }
      }
    }
  }}
/>
*/