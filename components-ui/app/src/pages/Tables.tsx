/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from 'react';
import { RemoteTable, Widgets, env} from '../tol-ui/src';


function Tables() {
  const [filter, setFilter] = useState<object>({});

  const table = (
    <RemoteTable
      id="run-data-table-v2"
      endpoint="run_data"
      filter={filter}
      setFilter={setFilter}
      height={500}
      fields={{
        "mlwh_run_id": {
          rename: "Run ID"
        },
        "mlwh_species.sts_scientific_name": {
          rename: "Species",
          cellRenderer: "relationshipDetail"
        },
        "mlwh_sequencing_request.id": {
          rename: "Sequencing Request"
        },
        "mlwh_run_complete": {
          rename: "Complete Date"
        },
        "mlwh_platform_type": {
          rename: "Platform"
        },
        "mlwh_instrument_model": {
          rename: "Instrument"
        },
        "mlwh_position": {
          rename: "Position"
        },
        "mlwh_tag_index": {
          rename: "Tag"
        }
      }}
      baseUrl={env.TOL_DATA}
    />
  );

  return (
    <div className="tables">
      <Widgets
        components={[table]}
      />
    </div>
  );
}

export default Tables;
