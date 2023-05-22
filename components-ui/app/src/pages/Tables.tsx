/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { CentreContents, AutoTable } from '../tol-ui/src'
import TempStatusExample from '../tol-ui/src/sandbox/TempStatusExample'


function Tables() {
  return (
    <div className="tables">
      <CentreContents>
      <AutoTable
        endpoint="samples"
        fields={{
          "id": {rename: "Row ID"},
          "tube_id": {
            cellRenderer: {
              element: TempStatusExample,
              propPointers: {
                tube_id: "tube_id"
              }
            }
          },
          "specimens.tolid": {rename: "ToL ID Prefix"},
          "specimens.species.name": {rename: "Species"},
          "created_at": {rename: "Created At"},
          "creator.name": {
            rename: "Creator",
            relationshipBox: true
          }
        }}
      />
      </CentreContents>
    </div>
  );
}

export default Tables;
