/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from 'react';
import { CentreContents, RemoteTable, env} from '../tol-ui/src';


function Tables() {
  const [filter, setFilter] = useState<object>({});

  return (
    <div className="tables">
      <CentreContents>
        <RemoteTable
          id="samples-v1"
          endpoint="sample"
          filter={filter}
          setFilter={setFilter}
          baseUrl={env.TOL_DATA}
        />
      </CentreContents>
    </div>
  );
}

export default Tables;

/*
import StatusExample from '../tol-ui/src/sandbox/StatusExample'

<RemoteTable
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
